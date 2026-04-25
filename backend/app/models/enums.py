from enum import Enum


class GenderOption(str, Enum):
    WOMEN = "Women"
    MEN = "Men"
    NON_BINARY = "Non-binary"


class RelationshipType(str, Enum):
    MONOGAMY = "Monogamy"
    POLYAMORY = "Polyamory"
    OPEN_TO_EITHER = "Open to Either"


class InterestOption(str, Enum):
    TRAVEL = "Travel"
    MUSIC = "Music"
    ART = "Art"
    SPORTS = "Sports"
    COOKING = "Cooking"
    READING = "Reading"
    TECHNOLOGY = "Technology"
    FITNESS = "Fitness"
    MOVIES = "Movies"
    PHOTOGRAPHY = "Photography"
    GAMING = "Gaming"
    NATURE = "Nature"


class RelationshipValue(str, Enum):
    EMOTIONAL_SUPPORT = "Emotional support"
    QUALITY_TIME = "Quality time"
    TRUST_CONNECTION = "Trust & connection"
    SHARED_EXPERIENCES = "Shared experiences"
    COMMITMENT = "Commitment"
    PHYSICAL_AFFECTION = "Physical affection"


class TimeWithPartner(str, Enum):
    MOSTLY_TOGETHER = "Mostly together"
    BALANCED = "Balanced"
    NEED_PERSONAL_SPACE = "Need personal space"
    DEPENDS = "Depends on the relationship"


class ConflictStyle(str, Enum):
    TALK_IT_OUT = "Talk it out right away"
    TAKE_SPACE = "Take space, then come back to it"
    AVOID = "Avoid it / keep the peace"


class IslandScenario(str, Enum):
    CRY = "Cry"
    EXPLORE = "Explore the island for resources"
    SIGNAL = "Try to signal for help"
    STAY_CALM = "Stay calm and make a plan"


class MusicalInstrument(str, Enum):
    GUITAR = "Guitar"
    PICCOLO = "Piccolo"
    TUBA = "Tuba"
    SAXOPHONE = "Saxophone"
    FLUTE = "Flute"
    CLARINET = "Clarinet"


class SexualityOption(str, Enum):
    STRAIGHT = "Straight"
    GAY = "Gay"
    LESBIAN = "Lesbian"
    BISEXUAL = "Bisexual"
    PANSEXUAL = "Pansexual"
    ASEXUAL = "Asexual"
    PREFER_NOT_TO_SAY = "Prefer not to say"


class SpendingHabit(str, Enum):
    FRUGAL = "Frugal / Saver"
    BALANCED = "Balanced"
    ENJOY_SPENDING = "Enjoy spending"
    LIVE_IN_THE_MOMENT = "Live in the moment"


class DebtStatus(str, Enum):
    NO_DEBT = "No debt"
    STUDENT_LOANS = "Student loans"
    CREDIT_CARD = "Credit card debt"
    PREFER_NOT_TO_SAY = "Prefer not to say"


class KidsPreference(str, Enum):
    YES = "Yes"
    NO = "No"
    MAYBE = "Maybe / Open to it"
    ALREADY_HAVE = "Already have kids"


class MatchStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    EXPIRED = "expired"
    DECLINED = "declined"


class InteractionType(str, Enum):
    CHAT = "chat"
    VOICE = "voice"
    VIDEO = "video"
