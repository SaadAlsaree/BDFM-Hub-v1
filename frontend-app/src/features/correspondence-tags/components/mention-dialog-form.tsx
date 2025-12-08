"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Mention, MentionContent, MentionInput, MentionItem, MentionLabel } from "@/components/ui/mention"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Users, Building2, Hash, AtSign, Sparkles, UserCheck } from "lucide-react"
import {
    RecipientTypeEnum,
  type CorrespondenceTagItem,
  type CorrespondenceTagsRequest,
 
} from "../types/tags"
import { OrganizationalUnit, UserInfo } from "../../correspondence/inbox-list/types/correspondence-details"

// Sample Users data - مستخدمين
const users: UserInfo[] = [
  {
    id: "u1",
    fullName: "أحمد محمد",
    email: "[email protected]",
    avatar: "/woman-with-brown-hair-professional.jpg",
    department: "تقنية المعلومات",
  },
  {
    id: "u2",
    fullName: "سارة أحمد",
    email: "[email protected]",
    avatar: "/asian-woman-professional-headshot.png",
    department: "الموارد البشرية",
  },
  {
    id: "u3",
    fullName: "خالد العلي",
    email: "[email protected]",
    avatar: "/professional-man-glasses.png",
    department: "المالية",
  },
  {
    id: "u4",
    fullName: "فاطمة حسن",
    email: "[email protected]",
    avatar: "/blonde-woman-smiling-professional.jpg",
    department: "التسويق",
  },
  {
    id: "u5",
    fullName: "عمر سالم",
    email: "[email protected]",
    avatar: "/korean-man-headshot.png",
    department: "العمليات",
  },
]

// Sample Units data - جهات
const units: OrganizationalUnit[] = [
  { id: "d1", name: "إدارة تقنية المعلومات", code: "IT-001", type: "إدارة" },
  { id: "d2", name: "إدارة الموارد البشرية", code: "HR-002", type: "إدارة" },
  { id: "d3", name: "الإدارة المالية", code: "FIN-003", type: "إدارة" },
  { id: "d4", name: "إدارة التسويق", code: "MKT-004", type: "إدارة" },
  { id: "d5", name: "إدارة العمليات", code: "OPS-005", type: "إدارة" },
  { id: "d6", name: "مكتب المدير العام", code: "CEO-006", type: "مكتب" },
]

export function MentionDialogForm() {
  const [open, setOpen] = React.useState(false)
  const [subject, setSubject] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // isAll state - when true, disables user and unit mentions
  const [isAll, setIsAll] = React.useState(false)

  // User mentions state (#)
  const [mentionedUsers, setMentionedUsers] = React.useState<string[]>([])
  const [userInputValue, setUserInputValue] = React.useState("")

  // Unit mentions state (@)
  const [mentionedUnits, setMentionedUnits] = React.useState<string[]>([])
  const [unitInputValue, setUnitInputValue] = React.useState("")

  // Build the correspondence tags data
  const buildCorrespondenceData = (): CorrespondenceTagItem[] => {
    const data: CorrespondenceTagItem[] = []

    if (isAll) {
      data.push({ isAll: true })
      return data
    }

    // Add user tags
    mentionedUsers.forEach((userName) => {
      const user = users.find((u) => u.fullName === userName)
      if (user) {
        data.push({
          name: user.fullName,
          toPrimaryRecipientType: RecipientTypeEnum.User,
          toPrimaryRecipientId: user.id,
        })
      }
    })

    // Add unit tags
    mentionedUnits.forEach((unitName) => {
      const unit = units.find((u) => u.name === unitName)
      if (unit) {
        data.push({
          name: unit.name,
          toPrimaryRecipientType: RecipientTypeEnum.Unit,
          toPrimaryRecipientId: unit.id,
        })
      }
    })

    return data
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const request: CorrespondenceTagsRequest = {
      correspondenceId: crypto.randomUUID(),
      data: buildCorrespondenceData(),
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Correspondence Request:", request)

    setIsSubmitting(false)
    setOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setSubject("")
    setIsAll(false)
    setMentionedUsers([])
    setUserInputValue("")
    setMentionedUnits([])
    setUnitInputValue("")
  }

  const handleIsAllChange = (checked: boolean) => {
    setIsAll(checked)
    if (checked) {
      // Clear all mentions when isAll is enabled
      setMentionedUsers([])
      setUserInputValue("")
      setMentionedUnits([])
      setUnitInputValue("")
    }
  }

  const getMentionedUserDetails = () => {
    return mentionedUsers.map((name) => users.find((u) => u.name === name)).filter(Boolean) as User[]
  }

  const getMentionedUnitDetails = () => {
    return mentionedUnits.map((name) => units.find((u) => u.name === name)).filter(Boolean) as Unit[]
  }

  const hasRecipients = isAll || mentionedUsers.length > 0 || mentionedUnits.length > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 font-medium shadow-lg hover:shadow-xl transition-shadow">
          <Send className="size-4" />
          مراسلة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden" dir="rtl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-primary/10">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">إنشاء مراسلة جديدة</DialogTitle>
              <DialogDescription className="text-sm">استخدم # للإشارة إلى مستخدم و @ للإشارة إلى جهة</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 py-5 space-y-5">
            {/* Subject Input */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium">
                الموضوع
              </Label>
              <Input
                id="subject"
                placeholder="أدخل موضوع المراسلة..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-11"
              />
            </div>

            {/* isAll Checkbox */}
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              <Checkbox id="isAll" checked={isAll} onCheckedChange={handleIsAllChange} className="size-5" />
              <div className="flex-1">
                <Label htmlFor="isAll" className="text-sm font-medium cursor-pointer">
                  إرسال للجميع
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  عند التفعيل، سيتم إرسال المراسلة لجميع المستخدمين والجهات
                </p>
              </div>
              <UserCheck className={`size-5 ${isAll ? "text-primary" : "text-muted-foreground"}`} />
            </div>

            {/* User Mention Input (#) */}
            <div className={isAll ? "opacity-50 pointer-events-none" : ""}>
              <Mention
                value={mentionedUsers}
                onValueChange={setMentionedUsers}
                inputValue={userInputValue}
                onInputValueChange={setUserInputValue}
                trigger="#"
                disabled={isAll}
              >
                <MentionLabel className="flex items-center gap-2">
                  <Hash className="size-3.5 text-blue-500" />
                  <span>المستخدمين</span>
                  <Badge variant="secondary" className="text-[10px] mr-auto">
                    استخدم #
                  </Badge>
                </MentionLabel>
                <MentionInput
                  placeholder={isAll ? "معطل - تم اختيار الإرسال للجميع" : "اكتب # للإشارة إلى مستخدم..."}
                  disabled={isAll}
                  className="[&_[data-tag]]:bg-blue-500/10 [&_[data-tag]]:text-blue-600"
                />
                <MentionContent>
                  {users.map((user) => (
                    <MentionItem key={user.id} value={user.name}>
                      <Avatar className="size-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="text-xs font-medium bg-blue-100 text-blue-700">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium truncate">{user.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-normal text-blue-600 border-blue-200">
                        {user.department}
                      </Badge>
                    </MentionItem>
                  ))}
                </MentionContent>
              </Mention>
            </div>

            {/* Unit Mention Input (@) */}
            <div className={isAll ? "opacity-50 pointer-events-none" : ""}>
              <Mention
                value={mentionedUnits}
                onValueChange={setMentionedUnits}
                inputValue={unitInputValue}
                onInputValueChange={setUnitInputValue}
                trigger="@"
                disabled={isAll}
              >
                <MentionLabel className="flex items-center gap-2">
                  <AtSign className="size-3.5 text-emerald-500" />
                  <span>الجهات</span>
                  <Badge variant="secondary" className="text-[10px] mr-auto">
                    استخدم @
                  </Badge>
                </MentionLabel>
                <MentionInput
                  placeholder={isAll ? "معطل - تم اختيار الإرسال للجميع" : "اكتب @ للإشارة إلى جهة..."}
                  disabled={isAll}
                  className="[&_[data-tag]]:bg-emerald-500/10 [&_[data-tag]]:text-emerald-600"
                />
                <MentionContent>
                  {units.map((unit) => (
                    <MentionItem key={unit.id} value={unit.name}>
                      <div className="flex items-center justify-center size-8 rounded-full bg-emerald-100">
                        <Building2 className="size-4 text-emerald-600" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium truncate">{unit.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{unit.code}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-normal text-emerald-600 border-emerald-200">
                        {unit.type}
                      </Badge>
                    </MentionItem>
                  ))}
                </MentionContent>
              </Mention>
            </div>

            {/* Recipients Preview */}
            {hasRecipients && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Users className="size-3.5" />
                  المستلمون
                </div>

                {isAll ? (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 text-primary">
                    <UserCheck className="size-4" />
                    <span className="text-sm font-medium">جميع المستخدمين والجهات</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Users */}
                    {mentionedUsers.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-blue-600">
                          <Hash className="size-3" />
                          المستخدمين ({mentionedUsers.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {getMentionedUserDetails().map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-medium text-blue-700"
                            >
                              <Avatar className="size-4">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback className="text-[8px] bg-blue-100">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              {user.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Units */}
                    {mentionedUnits.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                          <AtSign className="size-3" />
                          الجهات ({mentionedUnits.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {getMentionedUnitDetails().map((unit) => (
                            <div
                              key={unit.id}
                              className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700"
                            >
                              <Building2 className="size-3" />
                              {unit.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-muted/30 gap-2 sm:gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !subject.trim() || !hasRecipients}
              className="gap-2 min-w-[100px]"
            >
              {isSubmitting ? (
                <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {isSubmitting ? "جاري الإرسال..." : "إرسال"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
