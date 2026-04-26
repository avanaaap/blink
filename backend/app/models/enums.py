from enum import Enum


class GenderIdentity(str, Enum):
    MAN = "Man"
    WOMAN = "Woman"
    NON_BINARY = "Non-binary"
    PREFER_NOT_TO_SAY = "Prefer not to say"


class GenderOption(str, Enum):
    WOMEN = "Women"
    MEN = "Men"
    NON_BINARY = "Non-binary"


class RelationshipType(str, Enum):
    MONOGAMY = "Monogamy"
    POLYAMORY = "Polyamory"
    OPEN_TO_EITHER = "Open to Either"



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
    PENDING = "pending"
    ACTIVE = "active"
    UNMATCHED = "unmatched"
    CONNECTED = "connected"


class InteractionType(str, Enum):
    CHAT = "chat"
    VOICE = "voice"
    VIDEO = "video"
    POST_CONNECTION = "post_connection"


class StageDecision(str, Enum):
    MOVE_FORWARD = "move_forward"
    NOT_SURE = "not_sure"
    DONT_MOVE_FORWARD = "dont_move_forward"
