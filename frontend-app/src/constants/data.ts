import { NavItem } from '@/types';

export const ordersNavItems: NavItem[] = [
  {
    title: 'طلبات الموظفين',
    url: '/orders',
    icon: 'orders',
    shortcut: ['p', 'p'],
    isActive: false,
    requiredRoles: ['Orders', 'SuAdmin', 'Vacation'],
    items: [
      {
        title: 'طلبات الإجازة',
        url: '/leave-request',
        icon: 'orders',
        shortcut: ['l', 'r'],
        requiredPermissions: ['LeaveRequest|GetAllLeaveRequests', 'Access|All']
      },
      {
        title: 'مسارات العمل للإجازات',
        url: '/leave-workflow',
        icon: 'ellipsis',
        shortcut: ['l', 'w'],
        requiredPermissions: [
          'LeaveWorkflow|GetLeaveWorkflowList',
          'Access|All'
        ]
      },
      {
        title: 'سجل أرصدة الإجازات',
        url: '/leave-balance',
        icon: 'ellipsis',
        shortcut: ['l', 'b'],
        requiredPermissions: [
          'LeaveBalance|GetLeaveBalanceHistory',
          'Access|All'
        ]
      },
      {
        title: 'قوالب خطوات مسار العمل',
        url: '/leave-workflow-step-template',
        icon: 'ellipsis',
        shortcut: ['l', 't'],
        requiredPermissions: [
          'LeaveWorkflowStepTemplate|GetLeaveWorkflowStepTemplatesByWorkflowId',
          'Access|All'
        ]
      }
    ]
  }
];

export const presidentNavItems: NavItem[] = [
  {
    title: 'ملخص الكتب',
    url: '/correspondences-summary',
    icon: 'dashboard',
    shortcut: ['p', 'p'],
    isActive: false,
    requiredRoles: ['President', 'SuAdmin']
  },
  {
    title: 'إحصائيات خطوات سير العمل',
    url: '/workflow-statistics',
    icon: 'dashboard',
    shortcut: ['p', 'p'],
    isActive: false,
    requiredRoles: ['President', 'SuAdmin']
  },
  {
    title: 'الكتب',
    url: '/president',
    icon: 'inbox',
    shortcut: ['p', 'p'],
    isActive: false,
    requiredRoles: ['President', 'SuAdmin'],
    items: [
      {
        title: 'جميع الكتب',
        url: '/president/correspondence',
        icon: 'inbox',
        shortcut: ['p', 'p'],
        isActive: false,
        requiredPermissions: ['Correspondence|President', 'Access|All']
      },
      {
        title: 'الكتب الموجهة إليك',
        url: '/president/forwarded-books',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Correspondence|President', 'Access|All']
      },
      {
        title: 'الكتب المتابعة',
        url: '/president/favorite',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Correspondence|President', 'Access|All']
      },
      {
        title: 'الكتب في الانتظار أو قيد التنفيذ',
        url: '/president/pending-or-in-progress',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Correspondence|President', 'Access|All']
      },
      {
        title: 'موجهة إليي غير مكتملة',
        url: '/president/my-pending-or-in-progress',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Correspondence|President', 'Access|All']
      },
      {
        title: 'الكتب غير المكتملة',
        url: '/president/not-completed',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Correspondence|President', 'Access|All']
      },

      {
        title: 'الكتب المتأخرة',
        url: '/president/late-books',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Tracking|President', 'Access|All']
      },
      {
        title: 'إدارة الإعلانات',
        url: '/announcements',
        icon: 'ellipsis',
        shortcut: ['r', 'r'],
        requiredPermissions: ['President|GetAnnouncements', 'Access|All']
      }
    ]
  }
];

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  // {
  //   title: 'الاعمامات',
  //   url: '/public-books',
  //   icon: 'inbox',
  //   shortcut: ['p', 'p'],
  //   isActive: false,
  //   requiredRoles: ['Correspondence', 'SuAdmin'],
  // },
  {
    title: 'الكتب',
    url: '/home',
    icon: 'inbox',
    shortcut: ['p', 'p'],
    isActive: false,
    requiredRoles: ['Correspondence', 'SuAdmin'],
    items: [
      {
        title: 'جميع الكتب',
        url: '/correspondence',
        icon: 'inbox',
        shortcut: ['p', 'p'],
        isActive: false,
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      },
      {
        title: 'كتب قيد الانتظار',
        url: '/correspondence/pending-books',
        icon: 'star',
        shortcut: ['f', 'f'],
        isActive: false,
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      },
      {
        title: 'كتب قيد المعالجة',
        url: '/correspondence/processing-books',
        icon: 'star',
        shortcut: ['f', 'f'],
        isActive: false,
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      },
      {
        title: 'ارجاع للتعديل',
        url: '/correspondence/return-for-editing',
        icon: 'note',
        shortcut: ['d', 'd'],
        isActive: false,
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      },
      {
        title: 'الكتب المكتملة',
        url: '/correspondence/completed-books',
        icon: 'trash',
        shortcut: ['t', 't'],
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      },
      // {
      //   title: 'الكتب الموجهة إليك',
      //   url: '/correspondence/forwarded-books',
      //   icon: 'send',
      //   shortcut: ['o', 'o'],
      //   isActive: false,
      //   requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      // },
      {
        title: 'وارد داخلي',
        url: '/correspondence/incoming-internal-book-list',
        icon: 'send',
        shortcut: ['o', 'o'],
        isActive: false,
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      },
      {
        title: 'صادر داخلي',
        url: '/correspondence/outgoing-internal-book-list',
        icon: 'send',
        shortcut: ['o', 'o'],
        isActive: false,
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      },
      {
        title: 'وارد خارجي',
        url: '/correspondence/incoming-external-book-list',
        icon: 'send',
        shortcut: ['o', 'o'],
        isActive: false,
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      },
      {
        title: 'صادر خارجي',
        url: '/correspondence/outgoing-external-book-list',
        icon: 'send',
        shortcut: ['o', 'o'],
        isActive: false,
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      },
      {
        title: 'الأعمامات',
        url: '/public-mail',
        icon: 'send',
        shortcut: ['o', 'o'],
        isActive: false,
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      },
      // {
      //   title: 'الكتب المتأخرة',
      //   url: '/correspondence/late-books',
      //   icon: 'send',
      //   shortcut: ['l', 'l'],
      //   isActive: false,
      //   requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      // },
      {
        title: 'الكتب المستعجلة',
        url: '/correspondence/urgent-books',
        icon: 'send',
        shortcut: ['u', 'u'],
        isActive: false,
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      },
      {
        title: 'الكتب غير المقروئة',
        url: '/correspondence/unread',
        icon: 'note',
        shortcut: ['o', 'o'],
        isActive: false,
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      }
    ] // No child items
  },

  {
    title: 'الأعمامات',
    url: '/public-book',
    icon: 'note',
    shortcut: ['o', 'o'],
    isActive: false,
    requiredRoles: ['Correspondence', 'SuAdmin'],
    items: [
      {
        title: 'جميع الأعمامات',
        url: '/public-book',
        icon: 'note',
        shortcut: ['o', 'o'],
        isActive: false,
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      },
      {
        title: 'صوره عنه ',
        url: '/copy-of',
        icon: 'note',
        shortcut: ['o', 'o'],
        isActive: false,
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      }
    ]
  },

  {
    title: 'السيد المدير',
    url: '/manager',
    icon: 'note',
    shortcut: ['u', 'u'],
    isActive: false,
    requiredRoles: ['Manager', 'SuAdmin'],
    items: [
      {
        title: 'جميع الكتب',
        url: '/manager/correspondence',
        icon: 'inbox',
        shortcut: ['p', 'p'],
        isActive: false,
        requiredPermissions: ['Correspondence|Manager', 'Access|All']
      },
      {
        title: 'الكتب الموجهة إليك',
        url: '/manager/forwarded-books',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Correspondence|Manager', 'Access|All']
      },
      {
        title: 'الكتب المتابعة',
        url: '/manager/favorite',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Correspondence|Manager', 'Access|All']
      },
      {
        title: 'الكتب في الانتظار أو قيد التنفيذ',
        url: '/manager/pending-or-in-progress',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Correspondence|Manager', 'Access|All']
      },
      {
        title: 'موجهة إليي غير مكتملة',
        url: '/manager/my-pending-or-in-progress',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Correspondence|Manager', 'Access|All']
      },
      {
        title: 'الكتب غير المكتملة',
        url: '/manager/not-completed',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Correspondence|Manager', 'Access|All']
      },

      {
        title: 'الكتب المتأخرة',
        url: '/manager/late-books',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Tracking|Manager', 'Access|All']
      },
      {
        title: 'الكتب غير المقروئة',
        url: '/manager/unread',
        icon: 'note',
        shortcut: ['o', 'o'],
        isActive: false,
        requiredPermissions: ['Correspondence|Manager', 'Access|All']
      },
      {
        title: 'الكتب المستعجلة | الحرجة',
        url: '/manager/urgent',
        icon: 'note',
        shortcut: ['o', 'o'],
        isActive: false,
        requiredPermissions: ['Correspondence|Manager', 'Access|All']
      },
      {
        title: 'قيد التوقيع/المصادقة',
        url: '/manager/signing',
        icon: 'check',
        shortcut: ['s', 's'],
        isActive: false,
        requiredPermissions: ['Correspondence|Manager', 'Access|All']
      },
      {
        title: 'البريد المؤجل',
        url: '/manager/deferred',
        icon: 'clock',
        shortcut: ['d', 'd'],
        requiredPermissions: ['Correspondence|Manager', 'Access|All']
      }
    ]
  },

  {
    title: 'التتبع والمتابعة',
    url: '/tracking',
    icon: 'tracking',
    shortcut: ['t', 't'],
    isActive: false,
    requiredRoles: ['Tracking', 'SuAdmin'],
    items: [
      {
        title: 'الكتب الموجهة إليك',
        url: '/correspondence/forwarded-books',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      },
      {
        title: 'الكتب المتابعة',
        url: '/correspondence/favorite',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      },
      {
        title: 'الكتب في الانتظار أو قيد التنفيذ',
        url: '/correspondence/pending-or-in-progress',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      },
      {
        title: 'موجهة إليي غير مكتملة',
        url: '/correspondence/my-pending-or-in-progress',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      },
      {
        title: 'الكتب غير المكتملة',
        url: '/correspondence/not-completed',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      },

      {
        title: 'الكتب المتأخرة',
        url: '/late-books',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Tracking|GetLateBooks', 'Access|All']
      }
    ] // No child items
  },

  {
    title: 'الأدوات الذكية (AI Tools)',
    url: '/ai-tools',
    icon: 'sparkles',
    shortcut: ['a', 'i'],
    isActive: false,
    requiredRoles: ['Correspondence', 'SuAdmin', 'User'],
    items: [
      {
        title: 'معالج OCR',
        url: '/ai-tools/ocr',
        icon: 'sparkles',
        shortcut: ['a', 'i'],
        requiredPermissions: ['AiTools|GetOCR', 'Access|All']
      }
    ]
  },

  {
    title: 'أدارة الأضابير',
    url: '/files',
    icon: 'folder',
    shortcut: ['d', 'd'],
    isActive: false,
    requiredRoles: ['FileManagement', 'SuAdmin'],
    items: [
      {
        title: 'استعراض الأضابير',
        url: '/mail-files',
        icon: 'ellipsis',
        shortcut: ['r', 'r'],
        requiredPermissions: ['FileManagement|GetFiles', 'Access|All']
      },
      {
        title: 'إنشاء أضبارة جديدة',
        url: '/mail-files/new',
        icon: 'ellipsis',
        shortcut: ['r', 'r'],
        requiredPermissions: ['FileManagement|CreateFile', 'Access|All']
      }
    ] // No child items
  },

  {
    title: 'التقارير والإحصائيات',
    url: '/reports',
    icon: 'report',
    shortcut: ['r', 'r'],
    isActive: false,
    requiredRoles: ['Reports', 'SuAdmin'],
    items: [
      {
        title: 'لوحة المعلومات',
        url: '/dashboard',
        icon: 'ellipsis',
        shortcut: ['r', 'r'],
        requiredPermissions: ['Reports|GetReports', 'Access|All']
      },
      {
        title: 'مقاييس الكتب',
        url: '/correspondence-metrics',
        icon: 'ellipsis',
        shortcut: ['r', 'r'],
        requiredPermissions: ['Reports|GetReports', 'Access|All']
      },
      {
        title: 'ملخص الأداء اليومي',
        url: '/daily-performance',
        icon: 'ellipsis',
        shortcut: ['r', 'r'],
        requiredPermissions: ['Reports|GetReports', 'Access|All']
      }

      // {
      //   title: 'تقارير استراتيجية',
      //   url: '/reports',
      //   icon: 'ellipsis',
      //   shortcut: ['r', 'r'],
      //   requiredPermissions: ['Reports|GetReports', 'Access|All'],
      // }
    ] // No child items
  },

  {
    title: 'الإعدادات والإدارة',
    url: '/settings',
    icon: 'settings',
    shortcut: ['d', 'd'],
    isActive: false,
    requiredRoles: ['Settings', 'SuAdmin', 'Admin'],
    items: [
      {
        title: 'الهيكلية',
        url: '/structure',
        icon: 'ellipsis',
        shortcut: ['r', 'r'],
        requiredPermissions: ['Settings|GetStructure', 'Access|All']
      },
      {
        title: 'إدارة الجهات',
        url: '/organizational-unit',
        icon: 'ellipsis',
        shortcut: ['r', 'r'],
        requiredPermissions: ['Settings|GetOrganizationalUnits', 'Access|All']
      },
      {
        title: 'إدارة المستخدمين',
        url: '/users',
        icon: 'ellipsis',
        shortcut: ['u', 'u'],
        requiredPermissions: ['Settings|GetUsers', 'Access|All']
      },

      {
        title: 'إدارة الجهات الخارجية',
        url: '/external-entities',
        icon: 'ellipsis',
        shortcut: ['r', 'r'],
        requiredPermissions: ['Settings|GetExternalEntities', 'Access|All']
      },
      {
        title: 'إدارة نماذج الكتب',
        url: '/templates',
        icon: 'ellipsis',
        shortcut: ['r', 'r'],
        requiredPermissions: ['Settings|GetTemplates', 'Access|All']
      },
      {
        title: 'إدارة قوالب الكتب',
        url: '/correspondence-template',
        icon: 'ellipsis',
        shortcut: ['r', 'r'],
        requiredPermissions: ['Settings|GetBookTemplates', 'Access|All']
      },
      {
        title: 'إدارة مسارات العمل المخصصة',
        url: '/custom-workflow',
        icon: 'ellipsis',
        shortcut: ['r', 'r'],
        requiredPermissions: ['Settings|GetCustomWorkflows', 'Access|All']
      },
      {
        title: 'إدارة الإعلانات',
        url: '/announcements',
        icon: 'ellipsis',
        shortcut: ['r', 'r'],
        requiredPermissions: ['Settings|GetAnnouncements', 'Access|All']
      }
      // {
      //   title: 'إدارة أذونات الكتب الخارجية',
      //   url: '/roles',
      //   icon: 'ellipsis',
      //   shortcut: ['r', 'r'],
      //   requiredPermissions: ['Settings|GetRoles', 'Access|All'],
      // },
      // {
      //   title: 'إعدادات النظام',
      //   url: '/roles',
      //   icon: 'ellipsis',
      //   shortcut: ['r', 'r'],
      //   requiredPermissions: ['Settings|GetSettings', 'Access|All'],
      // },
      // {
      //   title: 'سجل التدقيق',
      //   url: '/roles',
      //   icon: 'ellipsis',
      //   shortcut: ['r', 'r'],
      //   requiredPermissions: ['Settings|GetAuditLog', 'Access|All'],
      // }
    ] // No child items
  },

  {
    title: 'إدارة الأدوار والصلاحيات',
    url: '/security',
    icon: 'shieldCog',
    shortcut: ['t', 't'],
    isActive: false,
    requiredRoles: ['Security', 'SuAdmin', 'Admin'],
    items: [
      {
        title: 'إدارة الأدوار',
        url: '/roles',
        icon: 'ellipsis',
        shortcut: ['r', 'r'],
        requiredPermissions: ['Security|GetRoles', 'Access|All']
      },
      {
        title: 'إدارة الصلاحيات',
        url: '/permission',
        icon: 'ellipsis',
        shortcut: ['p', 'p'],
        requiredPermissions: ['Security|GetPermissions', 'Access|All']
      },
      {
        title: 'إدارة التفويضات',
        url: '/delegation',
        icon: 'ellipsis',
        shortcut: ['d', 'd'],
        requiredPermissions: ['Security|GetDelegations', 'Access|All']
      }
    ]
  },

  {
    title: 'المساعدة والدعم',
    url: '/support',
    icon: 'template',
    shortcut: ['t', 't'],
    isActive: false,
    requiredRoles: ['Support', 'SuAdmin', 'User'],
    items: [
      {
        title: 'دليل المستخدم',
        url: '/support',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Access|All', 'User']
      },
      {
        title: 'عن النظام',
        url: '/support',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Access|All', 'User']
      },
      {
        title: 'اتصل بالدعم',
        url: '/support',
        icon: 'ellipsis',
        shortcut: ['t', 't'],
        requiredPermissions: ['Access|All', 'User']
      }
    ] // No child items
  }

  // {
  //   title: 'المزيد',
  //   url: '#', // Placeholder as there is no direct link for the parent
  //   icon: 'caretDown',
  //   isActive: true,

  //   items: [
  //     {
  //       title: 'كل البريد',
  //       url: '/all-emals',
  //       icon: 'inbox',
  //       shortcut: ['a', 'a']
  //     },
  //     {
  //       title: 'المهملات',
  //       url: '/trash',
  //       icon: 'trash',
  //       shortcut: ['t', 't']
  //     }
  //   ]
  // },
];
