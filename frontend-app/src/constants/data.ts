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
        requiredPermissions: ['LeaveWorkflow|GetLeaveWorkflowList', 'Access|All']
      },
      {
        title: 'سجل أرصدة الإجازات',
        url: '/leave-balance',
        icon: 'ellipsis',
        shortcut: ['l', 'b'],
        requiredPermissions: ['LeaveBalance|GetLeaveBalanceHistory', 'Access|All']
      },
      {
        title: 'قوالب خطوات مسار العمل',
        url: '/leave-workflow-step-template',
        icon: 'ellipsis',
        shortcut: ['l', 't'],
        requiredPermissions: ['LeaveWorkflowStepTemplate|GetLeaveWorkflowStepTemplatesByWorkflowId', 'Access|All']
      }
    ]
  }
];

export const presidentNavItems: NavItem[] = [
  {
    title: 'الرئيس',
    url: '/president',
    icon: 'inbox',
    shortcut: ['p', 'p'],
    isActive: false,
    requiredRoles: ['President', 'SuAdmin'],
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
      {
        title: 'الكتب المتأخرة',
        url: '/correspondence/late-books',
        icon: 'send',
        shortcut: ['l', 'l'],
        isActive: false,
        requiredPermissions: ['Correspondence|GetUserInbox', 'Access|All']
      },
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
    title: 'السيد المدير',
    url: '/manager',
    icon: 'note',
    shortcut: ['u', 'u'],
    isActive: false,
    requiredRoles: ['Manager', 'SuAdmin'],
    items: [
      {
        title: 'جميع الكتب',
        url: '/manager',
        icon: 'inbox',
        shortcut: ['p', 'p'],
        isActive: false,
        requiredPermissions: ['Correspondence|Manager', 'Access|All']
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
        title: 'البريد المميز',
        url: '/manager/favorite',
        icon: 'star',
        shortcut: ['f', 'f'],
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
        title: 'بحث متقدم',
        url: '/advanced-search',
        icon: 'ellipsis',
        shortcut: ['s', 's'],
        requiredPermissions: ['Tracking|Search', 'Access|All']
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
    title: 'المساعد الذكي',
    url: '/ai-assistant',
    icon: 'sparkles',
    shortcut: ['a', 'i'],
    isActive: false,
    requiredRoles: ['Correspondence', 'SuAdmin', 'User']
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
