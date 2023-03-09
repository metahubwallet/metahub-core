export const ErrorCodes = {
    NO_SIGNATURE:402,
    FORBIDDEN:403,
    TIMED_OUT:408,
    LOCKED:423,
    UPGRADE_REQUIRED:426,
    TOO_MANY_REQUESTS:429
};

export const ErrorTypes = {
    MALICIOUS:'malicious',
    LOCKED:'locked',
    PROMPT_CLOSED:'prompt_closed',
    UPGRADE_REQUIRED:'upgrade_required',
};


export default class SdkError {

    constructor(_type, _message, _code = ErrorCodes.LOCKED){
        this.type = _type;
        this.message = _message;
        this.code = _code;
        this.isError = true;
    }

    static locked(){
        return new SdkError(ErrorTypes.LOCKED, "The user's Scatter is locked. They have been notified and should unlock before continuing.")
    }

    static maliciousEvent(){
        return new SdkError(ErrorTypes.MALICIOUS, "Malicious event discarded.", ErrorCodes.FORBIDDEN)
    }

    static signatureError(_type, _message){
        return new SdkError(_type, _message, ErrorCodes.NO_SIGNATURE)
    }

    static requiresUpgrade(){
        return new SdkError(ErrorTypes.UPGRADE_REQUIRED, "The required version is newer than the User's Scatter", ErrorCodes.UPGRADE_REQUIRED)
    }

    static noNetwork(){
        return this.signatureError("no_network", "You must bind a network first");
    }

    static usedKeyProvider(){
        return new SdkError(
            ErrorTypes.MALICIOUS,
            "Do not use a `keyProvider` with a Scatter. Use a `signProvider` and return only signatures to this object. A malicious person could retrieve your keys otherwise.",
            ErrorCodes.NO_SIGNATURE
        )
    }

}