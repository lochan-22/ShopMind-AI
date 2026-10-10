"""Normalized, provider-independent product search data structures and normalization logic."""

from __future__ import annotations

from dataclasses import dataclass, field
import html
import math
import re
from typing import Any, Mapping


@dataclass(slots=True)
class ProductOffer:
    """A purchasable offer for a normalized product.

    Offer fields live separately from product details so multiple retailers
    or sources can be represented for the same underlying product.
    """

    price: float | None = None
    currency: str | None = None
    stock_status: str | None = None
    source_name: str | None = None
    product_url: str | None = None
    is_best_price: bool = False
    condition: str = "new"
    merchant_normalized: str | None = None


@dataclass(slots=True)
class NormalizedProduct:
    """A source-neutral product with zero or more available offers."""

    product_id: str
    name: str
    brand: str | None = None
    category: str | None = None
    description: str | None = None
    image_url: str | None = None
    rating: float | None = None
    review_count: int | None = None
    specifications: dict[str, str] = field(default_factory=dict)
    external_details_token: str | None = None
    offers: list[ProductOffer] = field(default_factory=list)

    # Normalization, deduplication and canonical identity fields
    model: str | None = None
    model_number: str | None = None
    condition: str = "new"
    variants: dict[str, str] = field(default_factory=dict)
    is_accessory: bool = False
    gtin: str | None = None
    normalized_title: str | None = None
    merged_product_ids: list[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Known brands registry for reliable brand extraction
# ---------------------------------------------------------------------------
KNOWN_BRANDS: dict[str, str] = {
    # Tech & Computing
    "apple": "Apple",
    "samsung": "Samsung",
    "sony": "Sony",
    "google": "Google",
    "dell": "Dell",
    "hp": "HP",
    "lenovo": "Lenovo",
    "asus": "Asus",
    "acer": "Acer",
    "msi": "MSI",
    "lg": "LG",
    "microsoft": "Microsoft",
    "intel": "Intel",
    "amd": "AMD",
    "nvidia": "Nvidia",
    "logitech": "Logitech",
    "razer": "Razer",
    "corsair": "Corsair",
    # Audio
    "boat": "boAt",
    "noise": "Noise",
    "boult": "Boult",
    "jbl": "JBL",
    "bose": "Bose",
    "sennheiser": "Sennheiser",
    "skullcandy": "Skullcandy",
    "marshall": "Marshall",
    "anker": "Anker",
    "soundcore": "Soundcore",
    "jabra": "Jabra",
    "beats": "Beats",
    "realme": "Realme",
    "oneplus": "OnePlus",
    "xiaomi": "Xiaomi",
    "redmi": "Redmi",
    "oppo": "Oppo",
    "vivo": "Vivo",
    "nothing": "Nothing",
    "motorola": "Motorola",
    "hammer": "Hammer",
    "zebronics": "Zebronics",
    "portronics": "Portronics",
    # Cameras & Imaging
    "canon": "Canon",
    "nikon": "Nikon",
    "fujifilm": "Fujifilm",
    "panasonic": "Panasonic",
    "gopro": "GoPro",
    "dji": "DJI",
    "olympus": "Olympus",
    "insta360": "Insta360",
    "kodak": "Kodak",
    # Footwear & Apparel
    "nike": "Nike",
    "adidas": "Adidas",
    "puma": "Puma",
    "reebok": "Reebok",
    "asics": "Asics",
    "new balance": "New Balance",
    "skechers": "Skechers",
    "under armour": "Under Armour",
    "woodland": "Woodland",
    "red tape": "Red Tape",
    "bata": "Bata",
    "sparx": "Sparx",
    "campus": "Campus",
    "asian": "Asian",
    "crocs": "Crocs",
    # Appliances & Home
    "philips": "Philips",
    "dyson": "Dyson",
    "havells": "Havells",
    "bajaj": "Bajaj",
    "prestige": "Prestige",
    "pigeon": "Pigeon",
}

# Merchant normalization mapping
MERCHANT_MAPPINGS: dict[str, str] = {
    "amazon": "Amazon.in",
    "amazon.in": "Amazon.in",
    "amazon india": "Amazon.in",
    "flipkart": "Flipkart",
    "flipkart.com": "Flipkart",
    "croma": "Croma",
    "croma.com": "Croma",
    "reliance digital": "Reliance Digital",
    "reliancedigital": "Reliance Digital",
    "reliancedigital.in": "Reliance Digital",
    "tatacliq": "Tata CLiQ",
    "tata cliq": "Tata CLiQ",
    "tatacliq.com": "Tata CLiQ",
    "nykaa": "Nykaa",
    "nykaa.com": "Nykaa",
    "jiomart": "JioMart",
    "jiomart.com": "JioMart",
    "vijay sales": "Vijay Sales",
    "vijaysales": "Vijay Sales",
    "myntra": "Myntra",
    "myntra.com": "Myntra",
    "ajio": "Ajio",
    "ajio.com": "Ajio",
}


class ProductNormalizer:
    """Convert provider records into the shared, clean product model.

    Handles:
    - HTML entity decoding and harmless whitespace/punctuation cleanup
    - Brand extraction and normalization
    - Model and model-number extraction
    - Condition detection (new vs refurbished vs used)
    - Variant extraction (RAM, storage, color, shoe size)
    - Accessory detection (cases, straps, chargers)
    - Multi-seller offer normalization
    """

    def normalize(self, product: Mapping[str, Any] | NormalizedProduct) -> NormalizedProduct:
        """Return one normalized product record."""
        if isinstance(product, NormalizedProduct):
            self._sort_offers(product.offers)
            return product
        if not isinstance(product, Mapping):
            raise TypeError("Product records must be mappings or NormalizedProduct instances.")

        product_id = self._first_value(product, "product_id", "id")
        name = self._first_value(product, "name", "product_name", "title")
        if product_id is None or str(product_id).strip() == "":
            raise ValueError("Product records must include a product_id or id.")
        if name is None or str(name).strip() == "":
            raise ValueError("Product records must include a name or product_name.")

        raw_title = str(name)
        clean_title = self.clean_title(raw_title)
        normalized_title = self.build_normalized_title(clean_title)

        # Detect condition
        condition = self.detect_condition(raw_title, product)

        # Detect accessory status
        is_accessory = self.detect_accessory(clean_title)

        # Extract brand
        brand = self.extract_brand(clean_title, product.get("brand"))

        # Extract model and model number
        model, model_number = self.extract_model(clean_title, brand)

        # Extract variants (RAM, storage, size, color)
        variants = self.extract_variants(clean_title)

        # Extract GTIN / UPC / EAN
        gtin = self._optional_text(
            self._first_value(product, "gtin", "upc", "ean", "isbn")
        )

        offers_value = product.get("offers")
        if offers_value is None:
            offers = [self._normalize_offer(product, condition=condition)]
        else:
            if isinstance(offers_value, (str, bytes)) or not isinstance(offers_value, list):
                raise TypeError("Product offers must be provided as a list of mappings.")
            offers = [self._normalize_offer(offer, condition=condition) for offer in offers_value]

        normalized_product = NormalizedProduct(
            product_id=str(product_id),
            name=clean_title,
            brand=brand,
            category=self._optional_text(product.get("category")),
            description=self._optional_text(product.get("description")),
            image_url=self._optional_text(self._first_value(product, "image_url", "image")),
            rating=self._optional_float(product.get("rating")),
            review_count=self._optional_int(product.get("review_count", product.get("reviews"))),
            specifications=self._specifications(product.get("specifications")),
            external_details_token=self._optional_text(product.get("external_details_token")),
            offers=offers,
            model=model,
            model_number=model_number,
            condition=condition,
            variants=variants,
            is_accessory=is_accessory,
            gtin=gtin,
            normalized_title=normalized_title,
            merged_product_ids=[str(product_id)],
        )
        self._sort_offers(normalized_product.offers)
        return normalized_product

    def normalize_many(
        self, products: list[Mapping[str, Any] | NormalizedProduct]
    ) -> list[NormalizedProduct]:
        """Normalize every product in a provider result list."""
        return [self.normalize(product) for product in products]

    # -----------------------------------------------------------------------
    # Title & Text Cleaning
    # -----------------------------------------------------------------------

    @staticmethod
    def clean_title(title: str) -> str:
        """Clean raw product title by unescaping HTML, collapsing whitespace,
        and stripping trailing marketing boilerplate without destroying the model name.
        """
        if not title:
            return ""

        # Decode HTML entities (&amp;, &#39;, &quot;, &nbsp;)
        text = html.unescape(title)

        # Remove trailing pipes and seller advertisement suffixes:
        # e.g., "... | Buy at Best Price", "... | Croma", "... | Free Delivery"
        text = re.sub(
            r"\s*\|\s*(buy online|best price|lowest price|free delivery|online shopping|croma|flipkart|amazon|reliance digital).*$",
            "",
            text,
            flags=re.IGNORECASE,
        )

        # Remove trailing store marketing parentheses:
        # e.g., "(Free Shipping)", "(COD Available)", "(Fast Delivery)"
        text = re.sub(
            r"\s*\(\s*(free shipping|fast delivery|in stock|cod available|online at best price)\s*\)",
            "",
            text,
            flags=re.IGNORECASE,
        )

        # Normalize multiple spaces, tabs, newlines
        text = re.sub(r"\s+", " ", text).strip()
        return text

    @staticmethod
    def build_normalized_title(clean_title: str) -> str:
        """Create a lowercase, punctuation-cleaned title for comparison purposes."""
        if not clean_title:
            return ""

        text = clean_title.lower()
        # Keep alphanumeric, spaces, hyphens, and decimal dots in numbers (e.g. 15.6, 2.0)
        text = re.sub(r"[^\w\s\.-]", " ", text)
        # Collapse whitespace
        text = re.sub(r"\s+", " ", text).strip()
        return text

    # -----------------------------------------------------------------------
    # Brand Extraction & Normalization
    # -----------------------------------------------------------------------

    @classmethod
    def extract_brand(cls, clean_title: str, raw_brand: Any = None) -> str | None:
        """Identify brand either from provider metadata or from the title."""
        # 1. Use explicit brand if provided and valid
        if raw_brand is not None and str(raw_brand).strip():
            raw_str = str(raw_brand).strip().lower()
            if raw_str in KNOWN_BRANDS:
                return KNOWN_BRANDS[raw_str]
            # Title-case generic brand string
            return str(raw_brand).strip().title()

        # 2. Extract brand from title
        clean_lower = clean_title.lower()
        # Check title words against known brands registry
        words = re.findall(r"[a-zA-Z0-9]+", clean_lower)
        if words:
            # First check 2-word brands (e.g., "new balance", "red tape", "under armour")
            if len(words) >= 2:
                two_word = f"{words[0]} {words[1]}"
                if two_word in KNOWN_BRANDS:
                    return KNOWN_BRANDS[two_word]

            # Check single first word
            if words[0] in KNOWN_BRANDS:
                return KNOWN_BRANDS[words[0]]

            # Scan first 4 words for a known brand
            for w in words[:4]:
                if w in KNOWN_BRANDS:
                    return KNOWN_BRANDS[w]

        return None

    # -----------------------------------------------------------------------
    # Model & Model Number Extraction
    # -----------------------------------------------------------------------

    @classmethod
    def extract_model(
        cls, clean_title: str, brand: str | None = None
    ) -> tuple[str | None, str | None]:
        """Extract model name and model number/code from clean title.

        Returns (model_name, model_number_normalized).
        Examples:
        - "Sony WH-1000XM4 Wireless Headphones" -> ("WH-1000XM4", "wh1000xm4")
        - "Canon EOS 1500D DSLR Camera" -> ("EOS 1500D", "eos1500d")
        - "Lenovo IdeaPad Slim 3 15IAU7" -> ("IdeaPad Slim 3 15IAU7", "15iau7")
        - "Apple iPhone 15 Pro 128GB" -> ("iPhone 15 Pro", "iphone15pro")
        """
        if not clean_title:
            return (None, None)

        title = clean_title

        # Common model code regex patterns:
        # e.g., WH-1000XM4, WH-CH520, WF-C500, EOS 1500D, EOS 200D II, Z50, A6700,
        # Aspire 5, Ideapad Slim 3, Pavilion 15, TUF Gaming A15, Rockerz 450, Tune 760NC, Galaxy S24
        model_patterns = [
            # Alphanumeric with hyphens: WH-1000XM4, WH-CH520, MDR-ZX110, WF-1000XM5
            r"\b([A-Z]{2,4}-?[0-9]{3,5}[A-Z0-9]{0,4})\b",
            # Camera models: EOS 1500D, EOS 200D II, EOS R50, EOS R6, Alpha A6700, Z6 II
            r"\b(EOS\s+[0-9]{3,4}[A-Z]*(?:\s+II|\s+Mark\s+[IVX]+)?)\b",
            r"\b(EOS\s+R[0-9]{1,3}(?:\s+Mark\s+[IVX]+)?)\b",
            r"\b(Alpha\s+[A-Za-z0-9]+|A[0-9]{4}[A-Za-z]?)\b",
            r"\b(Z[0-9]{1,2}(?:\s+II)?)\b",
            # Audio models: Rockerz 450, Rockerz 550, Airdopes 141, Tune 760NC, Tune 510BT, Major IV
            r"\b(Rockerz\s+[0-9]{3}[A-Za-z]*)\b",
            r"\b(Airdopes\s+[0-9]{3}[A-Za-z]*)\b",
            r"\b(Tune\s+[0-9]{3}[A-Za-z]*)\b",
            r"\b(Major\s+[IVX]+)\b",
            # Smartphone / Tablet models: iPhone 15 Pro Max, Galaxy S24 Ultra, Pixel 8a, Redmi Note 13 Pro
            r"\b(iPhone\s+[0-9]{1,2}(?:\s+Pro(?:\s+Max)?|\s+Plus)?)\b",
            r"\b(Galaxy\s+S[0-9]{2}(?:\s+Ultra|\s+Plus|\s+FE)?)\b",
            r"\b(Pixel\s+[0-9][a-z]?)\b",
            r"\b(Redmi\s+Note\s+[0-9]{1,2}(?:\s+Pro(?:\s+\+)?|\s+Pro)?)\b",
            # Laptop model series: Aspire 3/5/7, IdeaPad 3/5, ThinkPad E14/T14, Vivobook 15, Zenbook 14, TUF A15
            r"\b(Aspire\s+[0-9])\b",
            r"\b(IdeaPad(?:\s+Slim)?\s+[0-9][A-Za-z0-9]*)\b",
            r"\b(ThinkPad\s+[A-Z][0-9]{2})\b",
            r"\b(Vivobook\s+[0-9]{2})\b",
            r"\b(Zenbook\s+[0-9]{2})\b",
            r"\b(MacBook\s+(?:Air|Pro)(?:\s+[0-9]{1,2}-inch)?(?:\s+M[1-4](?:\s+Pro|\s+Max)?)?)\b",
        ]

        for pat in model_patterns:
            match = re.search(pat, title, re.IGNORECASE)
            if match:
                raw_match = match.group(1).strip()
                # Normalized alphanumeric key
                normalized_key = re.sub(r"[^a-zA-Z0-9]", "", raw_match).lower()
                return (raw_match, normalized_key)

        return (None, None)

    # -----------------------------------------------------------------------
    # Condition Detection
    # -----------------------------------------------------------------------

    @classmethod
    def detect_condition(cls, raw_title: str, raw_record: Mapping[str, Any]) -> str:
        """Detect product condition: 'new', 'refurbished', or 'used'.
        Never merge new and used/refurbished products.
        """
        text = f"{raw_title} {raw_record.get('second_hand_condition', '')} {raw_record.get('tag', '')} {' '.join(str(x) for x in raw_record.get('extensions', []))}".lower()

        if re.search(r"\b(refurbished|renewed|reconditioned|open box)\b", text):
            return "refurbished"
        if re.search(r"\b(used|pre-owned|second hand|secondhand)\b", text):
            return "used"

        return "new"

    # -----------------------------------------------------------------------
    # Variant Extraction (Storage, RAM, Size, Color)
    # -----------------------------------------------------------------------

    @classmethod
    def extract_variants(cls, clean_title: str) -> dict[str, str]:
        """Extract material variant attributes to prevent merging different configurations.
        Examples:
        - Storage: 128GB, 256GB, 512GB, 1TB
        - RAM: 8GB, 16GB, 32GB
        - Shoe Size: UK 7, UK 8, UK 9
        """
        variants: dict[str, str] = {}
        title_lower = clean_title.lower()

        # 1. RAM configuration (e.g. 8GB RAM, 16GB RAM, 8 GB DDR4, 16GB Memory)
        ram_match = re.search(r"\b([0-9]{1,3}\s*gb)\s*(?:ram|memory|ddr[345])\b", title_lower)
        if ram_match:
            ram_val = re.sub(r"\s+", "", ram_match.group(1)).lower()
            variants["ram"] = ram_val

        # 2. Storage capacity (e.g. 64GB, 128GB, 256GB, 512GB, 1TB, 2TB)
        storage_matches = list(re.finditer(r"\b([0-9]{2,4}\s*(?:gb|tb))\b", title_lower))
        for sm in storage_matches:
            val = re.sub(r"\s+", "", sm.group(1)).lower()
            if "ram" in variants and val == variants["ram"]:
                continue
            end_pos = sm.end()
            following_text = title_lower[end_pos : end_pos + 10]
            if re.match(r"\s*(?:ram|memory|ddr)", following_text):
                continue
            variants["storage"] = val
            break

        # 3. Shoe size (e.g. Size 8, UK 8, US 9, Size: 10)
        size_match = re.search(r"\b(?:uk|us|size)\s*[:#-]?\s*([0-9]{1,2}(?:\.[0-9])?)\b", title_lower)
        if size_match:
            variants["shoe_size"] = size_match.group(1)
            variants["size"] = f"UK {size_match.group(1)}"

        # 4. Screen size (e.g. 55 inch, 65 inch, 43 inch, 15.6 inch)
        screen_match = re.search(r"\b([0-9]{2}(?:\.[0-9])?)\s*(?:inch|\"|cm)\b", title_lower)
        if screen_match:
            variants["screen_size"] = f"{screen_match.group(1)} inch"

        return variants


    # -----------------------------------------------------------------------
    # Accessory Detection
    # -----------------------------------------------------------------------

    @classmethod
    def detect_accessory(cls, clean_title: str) -> bool:
        """Detect whether a listing is an accessory (case, skin, strap, charger)
        rather than the main hardware product.
        """
        title_lower = clean_title.lower()
        accessory_patterns = [
            r"\b(case|cover|skin|strap|pouch|sleeve)\s+(?:for|compatible with)\b",
            r"\b(replacement\s+ear\s*pads?|ear\s*cushions?|ear\s*tips?)\b",
            r"\b(charger|charging\s+cable|power\s+adapter)\s+(?:for|compatible with)\b",
            r"\b(screen\s+protector|tempered\s+glass)\s+(?:for|compatible with)\b",
            r"\b(camera\s+bag|lens\s+hood|tripod\s+mount)\b",
        ]
        return any(re.search(pat, title_lower) for pat in accessory_patterns)

    # -----------------------------------------------------------------------
    # Offer Normalization & Sorting
    # -----------------------------------------------------------------------

    def _normalize_offer(
        self, offer: Mapping[str, Any], condition: str = "new"
    ) -> ProductOffer:
        """Convert an individual raw offer mapping to ``ProductOffer``."""
        if not isinstance(offer, Mapping):
            raise TypeError("Each product offer must be a mapping.")

        raw_source = self._optional_text(
            self._first_value(offer, "source_name", "source", "retailer", "retailer_name")
        )
        normalized_merchant = self.normalize_merchant(raw_source)

        return ProductOffer(
            price=self._optional_float(offer.get("price", offer.get("extracted_price"))),
            currency=self._optional_text(offer.get("currency")) or "INR",
            stock_status=self._stock_status(offer.get("stock_status", offer.get("stock", offer.get("availability")))),
            source_name=raw_source,
            product_url=self._optional_text(self._first_value(offer, "product_url", "url", "link", "product_link")),
            condition=condition,
            merchant_normalized=normalized_merchant,
        )

    @classmethod
    def normalize_merchant(cls, source_name: str | None) -> str | None:
        """Normalize merchant name for grouping while preserving display name."""
        if not source_name:
            return None
        clean = source_name.strip().lower()
        return MERCHANT_MAPPINGS.get(clean, source_name.strip())

    @staticmethod
    def _sort_offers(offers: list[ProductOffer]) -> None:
        """Order valid numeric prices lowest-to-highest and mark exactly one lowest offer."""
        offers.sort(
            key=lambda offer: (
                offer.price is None,
                offer.price if offer.price is not None else 0.0,
            )
        )
        for offer in offers:
            offer.is_best_price = False
        for offer in offers:
            if offer.price is not None:
                offer.is_best_price = True
                break

    # -----------------------------------------------------------------------
    # Helper extractors
    # -----------------------------------------------------------------------

    @staticmethod
    def _first_value(values: Mapping[str, Any], *keys: str) -> Any:
        """Return the first non-``None`` value found for *keys*."""
        for key in keys:
            value = values.get(key)
            if value is not None:
                return value
        return None

    @staticmethod
    def _optional_text(value: Any) -> str | None:
        """Return a stripped string, preserving absent values as ``None``."""
        if value is None:
            return None
        text = str(value).strip()
        return text or None

    @staticmethod
    def _optional_float(value: Any) -> float | None:
        """Return a float from a numeric value or a displayed price string."""
        if value is None:
            return None
        try:
            converted_value = float(value)
            return converted_value if math.isfinite(converted_value) and converted_value >= 0 else None
        except (TypeError, ValueError):
            match = re.search(r"-?[\d,]+(?:\.\d+)?", str(value))
            if match is None:
                return None
            try:
                converted_value = float(match.group().replace(",", ""))
                return converted_value if math.isfinite(converted_value) and converted_value >= 0 else None
            except ValueError:
                return None

    @staticmethod
    def _optional_int(value: Any) -> int | None:
        """Return an integer from a numeric value or a displayed count string."""
        if value is None:
            return None
        try:
            return int(value)
        except (TypeError, ValueError):
            match = re.search(r"([\d,.]+)\s*([kKmM])?", str(value))
            if match is None:
                return None
            try:
                amount = float(match.group(1).replace(",", ""))
            except ValueError:
                return None
            multiplier = {"k": 1_000, "m": 1_000_000}.get(
                (match.group(2) or "").lower(), 1
            )
            return int(amount * multiplier)

    @staticmethod
    def _stock_status(value: Any) -> str | None:
        """Normalize boolean stock flags while preserving source status text."""
        if isinstance(value, bool):
            return "in_stock" if value else "out_of_stock"
        text = ProductNormalizer._optional_text(value)
        if text:
            t_lower = text.lower()
            if "in stock" in t_lower or "available" in t_lower:
                return "in_stock"
            if "out of stock" in t_lower or "sold out" in t_lower or "unavailable" in t_lower:
                return "out_of_stock"
        return text

    @staticmethod
    def _specifications(value: Any) -> dict[str, str]:
        """Keep only source-provided, non-empty specification pairs."""
        if not isinstance(value, Mapping):
            return {}
        return {
            str(key).strip(): str(item).strip()
            for key, item in value.items()
            if str(key).strip() and item is not None and str(item).strip()
        }
