export interface ChatMessage {
    _id: string;
    text: string;
    sender: {
        _id: string;
        fullName: string;
    };
    createdAt: string;
}

export interface Chat {
    _id: string;
    donation: string;
    donor: {
        _id: string;
        fullName: string;
        organizationName?: string;
    };
    ngo: {
        _id: string;
        fullName: string;
        organizationName?: string;
    };
    isActive: boolean;
}
