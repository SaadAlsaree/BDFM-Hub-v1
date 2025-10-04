import {
    SecrecyLevelEnum,
    PriorityLevelEnum,
    PersonalityLevelEnum,
    SecrecyLevelEnumDisplay,
    PriorityLevelEnumDisplay,
    PersonalityLevelEnumDisplay
} from '@/features/correspondence/types/register-incoming-external-mail';

export const secrecyLevelOptions = [
    { value: SecrecyLevelEnum.None.toString(), label: SecrecyLevelEnumDisplay[SecrecyLevelEnum.None] },
    { value: SecrecyLevelEnum.Limited.toString(), label: SecrecyLevelEnumDisplay[SecrecyLevelEnum.Limited] },
    { value: SecrecyLevelEnum.Secret.toString(), label: SecrecyLevelEnumDisplay[SecrecyLevelEnum.Secret] },
    { value: SecrecyLevelEnum.TopSecret.toString(), label: SecrecyLevelEnumDisplay[SecrecyLevelEnum.TopSecret] }
];

export const priorityLevelOptions = [
    { value: PriorityLevelEnum.None.toString(), label: PriorityLevelEnumDisplay[PriorityLevelEnum.None] },
    { value: PriorityLevelEnum.Normal.toString(), label: PriorityLevelEnumDisplay[PriorityLevelEnum.Normal] },
    { value: PriorityLevelEnum.Urgent.toString(), label: PriorityLevelEnumDisplay[PriorityLevelEnum.Urgent] },
    { value: PriorityLevelEnum.VeryUrgent.toString(), label: PriorityLevelEnumDisplay[PriorityLevelEnum.VeryUrgent] },
    { value: PriorityLevelEnum.Immediate.toString(), label: PriorityLevelEnumDisplay[PriorityLevelEnum.Immediate] }
];

export const personalityLevelOptions = [
    { value: PersonalityLevelEnum.General.toString(), label: PersonalityLevelEnumDisplay[PersonalityLevelEnum.General] },
    { value: PersonalityLevelEnum.Personal.toString(), label: PersonalityLevelEnumDisplay[PersonalityLevelEnum.Personal] },
    { value: PersonalityLevelEnum.ToBeOpenedByAddresseeOnly.toString(), label: PersonalityLevelEnumDisplay[PersonalityLevelEnum.ToBeOpenedByAddresseeOnly] }
];

export function formatSearchFilters(filters: Record<string, any>) {
    const formattedFilters: Record<string, any> = {};

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            formattedFilters[key] = value;
        }
    });

    return formattedFilters;
} 