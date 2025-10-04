import { correspondenceService } from '@/features/correspondence/api/correspondence.service';
import { attachmentService } from '@/features/attachments/api/attachment.service';
import {
    ExternalCorrespondencePayload,
    CorrespondenceLinkPayload,
    CorrespondenceLinkType
} from '@/features/correspondence/types/register-incoming-external-mail';
import { SaveResult } from '../types/wizard-types';
import { toast } from 'sonner';

export interface CorrespondenceSaveData {
    correspondenceData: ExternalCorrespondencePayload;
    linkingData?: {
        linkedCorrespondenceId: string;
        linkType: CorrespondenceLinkType;
        notes: string;
    };
    attachmentsData?: File[];
}

export class CorrespondenceSaver {
    constructor(
        private authApiCall: (apiCall: () => Promise<any>) => Promise<any>,
        private currentUserId: string
    ) { }

    async save(data: CorrespondenceSaveData): Promise<SaveResult> {
        try {
            // Step 1: Save correspondence data
            const correspondence = await this.saveCorrespondence(data.correspondenceData);
            if (!correspondence) {
                return { success: false, errors: ['فشل في حفظ بيانات المراسلة'] };
            }

            const errors: string[] = [];
            console.log(correspondence);

            // Step 2: Link correspondence (optional)
            if (data.linkingData?.linkedCorrespondenceId) {
                const linkSuccess = await this.linkCorrespondence(correspondence, data.linkingData);
                if (!linkSuccess) {
                    errors.push('فشل في ربط المراسلة');
                }
            }

            // Step 3: Upload attachments (optional)
            if (data.attachmentsData?.length) {
                const attachmentSuccess = await this.uploadAttachments(correspondence, data.attachmentsData);
                if (!attachmentSuccess) {
                    errors.push('فشل في رفع بعض المرفقات');
                }
            }

            // Show success message
            if (errors.length === 0) {
                toast.success('تم تسجيل المراسلة الصادرة بنجاح!');
            } else {
                toast.success('تم تسجيل المراسلة الصادرة بنجاح مع بعض التحذيرات');
            }

            return {
                success: true,
                correspondenceId: correspondence,
                errors
            };

        } catch (error) {
            console.error('Outgoing correspondence save error:', error);
            toast.error('حدث خطأ غير متوقع أثناء الحفظ');
            return {
                success: false,
                errors: ['حدث خطأ غير متوقع']
            };
        }
    }

    private async saveCorrespondence(data: ExternalCorrespondencePayload): Promise<string | null> {
        try {
            // For outgoing mail, we might need a different API endpoint
            // For now, using the same service but this could be adapted
            const response = await this.authApiCall(() =>
                correspondenceService.createOutgoingExternalMail(data)
            );
            return response?.succeeded && response.data ? response.data : null;
        } catch (error) {
            console.error('Failed to save outgoing correspondence:', error);
            return null;
        }
    }

    private async linkCorrespondence(
        correspondenceId: string,
        linkData: { linkedCorrespondenceId: string; linkType: CorrespondenceLinkType; notes: string }
    ): Promise<boolean> {
        try {
            const linkPayload: CorrespondenceLinkPayload = {
                sourceCorrespondenceId: correspondenceId,
                linkedCorrespondenceId: linkData.linkedCorrespondenceId,
                linkType: linkData.linkType,
                notes: linkData.notes || ''
            };

            const response = await this.authApiCall(() =>
                correspondenceService.linkCorrespondences(linkPayload)
            );
            return response?.succeeded || false;
        } catch (error) {
            console.error('Failed to link outgoing correspondence:', error);
            return false;
        }
    }

    private async uploadAttachments(correspondenceId: string, attachments: File[]): Promise<boolean> {
        try {
            const uploadPromises = attachments.map(async (file) => {
                try {
                    // Validate file size (10MB limit)
                    const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
                    if (file.size > maxFileSize) {
                        console.error(`File ${file.name} exceeds size limit`);
                        return false;
                    }

                    // Prepare metadata for FormData upload
                    const metadata = {
                        primaryTableId: correspondenceId,
                        tableName: 2, // Correspondence table
                        description: (file as any).description || file.name,
                        createBy: this.currentUserId
                    };

                    // Use FormData upload instead of base64
                    const response = await this.authApiCall(() =>
                        attachmentService.createAttachmentFormData(file, metadata)
                    );

                    if (response?.succeeded) {
                        console.log(`Successfully uploaded: ${file.name}`);
                        return true;
                    } else {
                        console.error(`Failed to upload ${file.name}:`, response);
                        return false;
                    }
                } catch (fileError) {
                    console.error(`Error processing file ${file.name}:`, fileError);
                    return false;
                }
            });

            const results = await Promise.allSettled(uploadPromises);
            const successfulUploads = results.filter(result =>
                result.status === 'fulfilled' && result.value === true
            ).length;

            console.log(`Uploaded ${successfulUploads} out of ${attachments.length} attachments`);

            // Return true if at least one file was uploaded successfully
            return successfulUploads > 0;
        } catch (error) {
            console.error('Failed to upload attachments:', error);
            return false;
        }
    }
} 