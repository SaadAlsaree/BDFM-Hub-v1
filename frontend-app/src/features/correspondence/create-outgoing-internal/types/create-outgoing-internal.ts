export interface OutgoingInternalMailPayload {
    id?: string;
    mailNum?: string;
    mailDate: string; // ISO Date format e.g., "2025-07-29"
    subject: string;
    bodyText: string;
    secrecyLevel: SecrecyLevelEnum;
    priorityLevel: PriorityLevelEnum;
    personalityLevel: PersonalityLevelEnum;
    fileId: string; // UUID
    linkMailId: string; // UUID
    createdByUserId: string; // UUID
    fileNumberToReuse: string;
}


export enum SecrecyLevelEnum {
    None = 0,        // عام
    Limited = 1,     // محدود
    Secret = 2,      // سري
    TopSecret = 3    // سري للغاية
}

export const SecrecyLevelEnumDisplay: Record<SecrecyLevelEnum, string> = {
    [SecrecyLevelEnum.None]: "عام",
    [SecrecyLevelEnum.Limited]: "محدود",
    [SecrecyLevelEnum.Secret]: "سري",
    [SecrecyLevelEnum.TopSecret]: "سري للغاية"
};

export enum PriorityLevelEnum {
    None = 0,        // غير مرتبة
    Normal = 1,      // عادي
    Urgent = 2,      // مستعجل
    VeryUrgent = 3,  // مستعجل جدا
    Immediate = 4    // فوري
}

export const PriorityLevelEnumDisplay: Record<PriorityLevelEnum, string> = {
    [PriorityLevelEnum.None]: "غير مرتبة",
    [PriorityLevelEnum.Normal]: "عادي",
    [PriorityLevelEnum.Urgent]: "مستعجل",
    [PriorityLevelEnum.VeryUrgent]: "مستعجل جدا",
    [PriorityLevelEnum.Immediate]: "فوري"
};


export enum PersonalityLevelEnum {
    General = 0,                  // عام
    Personal = 1,                 // شخصي
    ToBeOpenedByAddresseeOnly = 2 // يفتح بالذات
}

export const PersonalityLevelEnumDisplay: Record<PersonalityLevelEnum, string> = {
    [PersonalityLevelEnum.General]: "عام",
    [PersonalityLevelEnum.Personal]: "شخصي",
    [PersonalityLevelEnum.ToBeOpenedByAddresseeOnly]: "يفتح بالذات"
};