import Mock from 'mockjs'
import { DEMO_USERS, ROLE_LABEL } from '../config/roles'
import { storage } from '../utils/storage'
import type { ChildRecord, ChildStatus } from '../types/child'
import type { Role } from '../types/auth'

const CHILD_STORAGE_KEY = 'kg-mock-children'
const NOTICE_STORAGE_KEY = 'kg-mock-notices'
const RECIPE_STORAGE_KEY = 'kg-mock-recipe'
const HAS_BOOTSTRAP_KEY = 'kg-mock-bootstrapped'

const STATUS_POOL: ChildStatus[] = ['在园', '请假', '毕业', '退学']
const CLASS_POOL = ['小一班', '小二班', '中一班', '中二班', '大一班', '大二班']

const createResponse = <T>(data: T, message = 'success', code = 0) => ({
  code,
  message,
  data,
})

const parseBody = <T>(rawBody: string): T | null => {
  if (!rawBody) {
    return null
  }
  try {
    return JSON.parse(rawBody) as T
  } catch (error) {
    console.error('[mock] 解析请求体失败', error)
    return null
  }
}

const randomChild = (index: number): ChildRecord => {
  const gender = Math.random() > 0.5 ? '男' : '女'
  const status = STATUS_POOL[Math.floor(Math.random() * STATUS_POOL.length)]
  const className = CLASS_POOL[Math.floor(Math.random() * CLASS_POOL.length)]

  return {
    id: `child-${index + 1}`,
    studentNo: `KG${(1000 + index).toString()}`,
    name: Mock.Random.cname(),
    gender,
    birthDate: Mock.Random.date('yyyy-MM-dd'),
    idCard: `${Mock.Random.integer(110000, 650000)}${Mock.Random.integer(2005, 2020)}${Mock.Random.integer(1, 12)
      .toString()
      .padStart(2, '0')}${Mock.Random.integer(1, 28).toString().padStart(2, '0')}${Mock.Random.integer(100, 999)}${gender === '男' ? '1' : '2'}`,
    address: `${Mock.Random.county(true)}${Mock.Random.ctitle(4, 8)}号`,
    className,
    status,
    avatar: `https://api.dicebear.com/9.x/adventurer/svg?seed=child-${index + 1}`,
    parentName: Mock.Random.cname(),
    parentMobile: `13${Mock.Random.integer(300000000, 999999999)}`,
    relation: Math.random() > 0.5 ? '父亲' : '母亲',
    pickupPermission: Math.random() > 0.2,
    allergyHistory: Math.random() > 0.6 ? '无' : '牛奶过敏',
    medicalHistory: Math.random() > 0.7 ? '无' : '轻微支气管炎',
    vaccineRecord: '国家免疫规划疫苗接种完整',
    height: Mock.Random.integer(95, 128),
    weight: Mock.Random.integer(12, 30),
  }
}

const bootstrapData = () => {
  const hasBootstrapped = localStorage.getItem(HAS_BOOTSTRAP_KEY)
  if (hasBootstrapped) {
    return
  }

  const children = Array.from({ length: 32 }, (_, index) => randomChild(index))
  storage.set(CHILD_STORAGE_KEY, children)

  storage.set(NOTICE_STORAGE_KEY, [
    {
      id: 'notice-1',
      title: '端午节亲子活动通知',
      content: '本周五下午开展亲子手工活动，请家长提前报名。',
      read: false,
      createdAt: '2026-06-01 09:20',
    },
    {
      id: 'notice-2',
      title: '夏季防暑提醒',
      content: '请为幼儿准备替换衣物与饮水杯，避免中暑。',
      read: true,
      createdAt: '2026-05-30 16:10',
    },
    {
      id: 'notice-3',
      title: '六月食谱已发布',
      content: '本月食谱强调高蛋白搭配，欢迎查看营养分析。',
      read: false,
      createdAt: '2026-05-29 11:08',
    },
  ])

  storage.set(RECIPE_STORAGE_KEY, [
    {
      id: 'recipe-mon',
      day: '周一',
      breakfast: ['南瓜粥', '鸡蛋羹'],
      lunch: ['番茄牛腩饭', '青菜豆腐汤'],
      dinner: ['杂粮馒头', '西兰花虾仁'],
      calories: 1120,
    },
    {
      id: 'recipe-tue',
      day: '周二',
      breakfast: ['燕麦奶', '蔬菜包'],
      lunch: ['土豆炖鸡块', '紫菜蛋花汤'],
      dinner: ['小米饭', '胡萝卜炒肉丝'],
      calories: 1080,
    },
    {
      id: 'recipe-wed',
      day: '周三',
      breakfast: ['玉米糊', '小笼包'],
      lunch: ['香菇肉末面', '菠菜蛋花汤'],
      dinner: ['南瓜饭', '清蒸鱼柳'],
      calories: 1160,
    },
    {
      id: 'recipe-thu',
      day: '周四',
      breakfast: ['红豆粥', '鸡蛋卷'],
      lunch: ['咖喱鸡丁饭', '冬瓜排骨汤'],
      dinner: ['芝麻花卷', '西红柿炒蛋'],
      calories: 1110,
    },
    {
      id: 'recipe-fri',
      day: '周五',
      breakfast: ['牛奶麦片', '蔬菜蒸饺'],
      lunch: ['胡萝卜牛肉粒', '菌菇汤'],
      dinner: ['藜麦饭', '豆角炒肉末'],
      calories: 1180,
    },
  ])

  localStorage.setItem(HAS_BOOTSTRAP_KEY, '1')
}

const getChildren = (): ChildRecord[] => storage.get<ChildRecord[]>(CHILD_STORAGE_KEY, [])

const setChildren = (list: ChildRecord[]) => storage.set(CHILD_STORAGE_KEY, list)

const getChildrenByQuery = (url: string): ChildRecord[] => {
  const [, queryString = ''] = url.split('?')
  const query = new URLSearchParams(queryString)
  const name = query.get('name')?.trim() ?? ''
  const className = query.get('className')?.trim() ?? ''
  const parentMobile = query.get('parentMobile')?.trim() ?? ''

  return getChildren().filter((item) => {
    const matchName = !name || item.name.includes(name) || item.studentNo.includes(name)
    const matchClass = !className || item.className.includes(className)
    const matchMobile = !parentMobile || item.parentMobile.includes(parentMobile)
    return matchName && matchClass && matchMobile
  })
}

export const setupMock = () => {
  bootstrapData()
  Mock.setup({ timeout: '250-700' })

  Mock.mock(/\/api\/auth\/login/, 'post', (options) => {
    const body = parseBody<{ username: string; password: string; role: Role }>(options.body)
    if (!body) {
      return createResponse(null, '请求参数错误', 1)
    }

    const roleInfo = DEMO_USERS[body.role]
    const valid =
      roleInfo.username === body.username.trim() && roleInfo.password === body.password.trim()

    if (!valid) {
      return createResponse(null, '账号或密码错误，请使用演示账号', 1)
    }

    return createResponse({
      token: `kg-token-${Date.now()}`,
      user: {
        id: `user-${body.role}`,
        name: roleInfo.name,
        role: body.role,
        avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${body.role}`,
      },
    })
  })

  Mock.mock(/\/api\/dashboard\/overview/, 'get', () => {
    const children = getChildren()
    const inSchool = children.filter((item) => item.status === '在园').length
    const leave = children.filter((item) => item.status === '请假').length
    const absent = Math.max(Math.floor(children.length * 0.05), 1)

    return createResponse({
      childrenTotal: children.length,
      classTotal: CLASS_POOL.length,
      staffTotal: 36,
      todayAttendance: {
        shouldArrive: children.length,
        arrived: inSchool,
        leave,
        absent,
      },
      weekRecipeSummary: [
        { day: '周一', calories: 1120 },
        { day: '周二', calories: 1080 },
        { day: '周三', calories: 1160 },
        { day: '周四', calories: 1110 },
        { day: '周五', calories: 1180 },
      ],
      monthlyIncomeTrend: [
        { month: '1月', income: 32, expense: 19 },
        { month: '2月', income: 34, expense: 22 },
        { month: '3月', income: 37, expense: 24 },
        { month: '4月', income: 40, expense: 26 },
        { month: '5月', income: 43, expense: 28 },
      ],
    })
  })

  Mock.mock(/\/api\/children(\?.*)?$/, 'get', (options) => {
    const list = getChildrenByQuery(options.url)
    return createResponse({ list, total: list.length })
  })

  Mock.mock(/\/api\/children$/, 'post', (options) => {
    const body = parseBody<Partial<ChildRecord>>(options.body)
    if (!body) {
      return createResponse(null, '新增失败，请检查参数', 1)
    }

    const list = getChildren()
    const nextIndex = list.length + 1
    const newItem: ChildRecord = {
      id: `child-${Date.now()}`,
      studentNo: body.studentNo ?? `KG${(1000 + nextIndex).toString()}`,
      name: body.name ?? '',
      gender: body.gender ?? '男',
      birthDate: body.birthDate ?? Mock.Random.date('yyyy-MM-dd'),
      idCard: body.idCard ?? `${Mock.Random.integer(110000, 650000)}${Mock.Random.integer(2005, 2020)}01011001`,
      address: body.address ?? '',
      className: body.className ?? CLASS_POOL[0],
      status: body.status ?? '在园',
      avatar: body.avatar,
      parentName: body.parentName ?? '',
      parentMobile: body.parentMobile ?? '',
      relation: body.relation ?? '父亲',
      pickupPermission: body.pickupPermission ?? true,
      allergyHistory: body.allergyHistory ?? '无',
      medicalHistory: body.medicalHistory ?? '无',
      vaccineRecord: body.vaccineRecord ?? '国家免疫规划疫苗接种完整',
      height: body.height ?? 105,
      weight: body.weight ?? 18,
    }

    list.unshift(newItem)
    setChildren(list)
    return createResponse(newItem)
  })

  Mock.mock(/\/api\/children\/.+/, 'put', (options) => {
    const id = options.url.split('/').pop() ?? ''
    const body = parseBody<Partial<ChildRecord>>(options.body)
    if (!body) {
      return createResponse(null, '修改失败，请检查参数', 1)
    }

    const list = getChildren()
    const index = list.findIndex((item) => item.id === id)
    if (index < 0) {
      return createResponse(null, '记录不存在', 1)
    }

    const merged = { ...list[index], ...body, id: list[index].id, studentNo: list[index].studentNo }
    list[index] = merged
    setChildren(list)
    return createResponse(merged)
  })

  Mock.mock(/\/api\/children\/.+/, 'delete', (options) => {
    const id = options.url.split('/').pop() ?? ''
    const list = getChildren().filter((item) => item.id !== id)
    setChildren(list)
    return createResponse({ id })
  })

  Mock.mock(/\/api\/attendance\/summary/, 'get', () => {
    const children = getChildren()
    return createResponse({
      stats: [
        { label: '应到', value: children.length, trend: 1.8 },
        { label: '实到', value: Math.floor(children.length * 0.91), trend: 2.1 },
        { label: '请假', value: Math.max(Math.floor(children.length * 0.06), 1), trend: -0.8 },
        { label: '缺勤', value: Math.max(Math.floor(children.length * 0.03), 1), trend: -0.4 },
      ],
      records: children.slice(0, 12).map((item) => ({
        id: item.id,
        name: item.name,
        className: item.className,
        status: item.status === '在园' ? '正常' : item.status,
        date: Mock.Random.date('yyyy-MM-dd'),
      })),
    })
  })

  Mock.mock(/\/api\/recipe\/weekly/, 'get', () => {
    const list = storage.get(RECIPE_STORAGE_KEY, [])
    return createResponse({ list })
  })

  Mock.mock(/\/api\/growth\/timeline/, 'get', () => {
    const list = getChildren().slice(0, 8).map((item, index) => ({
      id: `growth-${index + 1}`,
      childName: item.name,
      content: `${item.name}在今日区域活动中表现积极，完成了拼图挑战。`,
      createdAt: Mock.Random.datetime('yyyy-MM-dd HH:mm'),
      media: [
        `https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80&sig=${index + 3}`,
      ],
    }))

    return createResponse({ list })
  })

  Mock.mock(/\/api\/home\/notices/, 'get', () => {
    const list = storage.get(NOTICE_STORAGE_KEY, [])
    return createResponse({ list })
  })

  Mock.mock(/\/api\/health\/morning-check/, 'get', () => {
    const list = getChildren().slice(0, 14).map((item, index) => ({
      id: `check-${index + 1}`,
      childName: item.name,
      className: item.className,
      temperature: Number((36 + Math.random() * 1.8).toFixed(1)),
      oralCheck: Math.random() > 0.15 ? '正常' : '轻度红肿',
      handCheck: Math.random() > 0.1 ? '正常' : '轻微皮疹',
      spirit: Math.random() > 0.12 ? '良好' : '一般',
      abnormal: Math.random() > 0.8,
    }))

    return createResponse({ list })
  })

  Mock.mock(/\/api\/staff\/list/, 'get', () => {
    const list = [
      { id: 's1', name: '王美玲', department: '教学部', role: '班主任', phone: '13812340111', certExpireDate: '2027-03-12', status: '在职' },
      { id: 's2', name: '周静', department: '保健室', role: '保健医', phone: '13812340222', certExpireDate: '2026-08-26', status: '在职' },
      { id: 's3', name: '徐海波', department: '财务室', role: '财务主管', phone: '13812340333', certExpireDate: '2026-11-09', status: '在职' },
      { id: 's4', name: '李晨', department: '后勤部', role: '生活老师', phone: '13812340444', certExpireDate: '2026-06-28', status: '试用' },
    ]
    return createResponse({ list })
  })

  Mock.mock(/\/api\/finance\/summary/, 'get', () => {
    return createResponse({
      stats: [
        { label: '本月收费率', value: 96, trend: 2.3 },
        { label: '欠费金额(千元)', value: 18, trend: -1.1 },
        { label: '本月支出(千元)', value: 126, trend: 4.6 },
        { label: '净结余(千元)', value: 38, trend: 1.4 },
      ],
      trend: [
        { month: '1月', income: 152, expense: 108 },
        { month: '2月', income: 149, expense: 110 },
        { month: '3月', income: 158, expense: 114 },
        { month: '4月', income: 166, expense: 121 },
        { month: '5月', income: 171, expense: 126 },
      ],
    })
  })

  Mock.mock(/\/api\/rbac\/users/, 'get', () => {
    const list = (Object.keys(DEMO_USERS) as Role[]).map((role, index) => ({
      id: `rbac-user-${index + 1}`,
      username: DEMO_USERS[role].username,
      role: ROLE_LABEL[role],
      status: true,
    }))
    return createResponse({ list })
  })

  Mock.mock(/\/api\/rbac\/roles/, 'get', () => {
    const list = [
      { id: 'r1', roleName: '园长', userCount: 1 },
      { id: 'r2', roleName: '班主任', userCount: 8 },
      { id: 'r3', roleName: '配班老师', userCount: 6 },
      { id: 'r4', roleName: '保健医', userCount: 2 },
      { id: 'r5', roleName: '财务', userCount: 2 },
      { id: 'r6', roleName: '家长', userCount: 112 },
    ]
    return createResponse({ list })
  })
}
