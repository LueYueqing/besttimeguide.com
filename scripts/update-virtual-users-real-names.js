/**
 * 更新虚拟用户为真实的英文姓名
 * 使用方法: node scripts/update-virtual-users-real-names.js
 */
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// 真实的英文姓氏
const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
  'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris',
  'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright',
  'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall',
  'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
]

// 真实的英文名字（男性）
const maleFirstNames = [
  'James', 'John', 'Robert', 'Michael', 'William',
  'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark',
  'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua',
  'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy',
  'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan',
  'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan',
  'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon',
  'Benjamin', 'Samuel', 'Frank', 'Gregory', 'Raymond',
  'Alexander', 'Patrick', 'Jack', 'Dennis', 'Jerry'
]

// 真实的英文名字（女性）
const femaleFirstNames = [
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara',
  'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Nancy', 'Lisa', 'Betty', 'Margaret', 'Sandra',
  'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle',
  'Dorothy', 'Carol', 'Amanda', 'Melissa', 'Deborah',
  'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia',
  'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna',
  'Brenda', 'Pamela', 'Nicole', 'Emma', 'Samantha',
  'Katherine', 'Christine', 'Debra', 'Rachel', 'Catherine',
  'Carolyn', 'Janet', 'Ruth', 'Maria', 'Heather'
]

// 生成真实的全名
function generateRealName(index) {
  // 交替使用男女名字
  const isFemale = index % 2 === 0
  const firstNames = isFemale ? femaleFirstNames : maleFirstNames
  const firstName = firstNames[index % firstNames.length]
  const lastName = lastNames[index % lastNames.length]
  return `${firstName} ${lastName}`
}

async function updateVirtualUsers() {
  try {
    console.log('\n🔄 正在更新虚拟用户的真实姓名...\n')

    // 获取所有虚拟用户（邮箱包含 virtual_user）
    const virtualUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: 'virtual_user'
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: {
        id: 'asc'
      }
    })

    if (virtualUsers.length === 0) {
      console.log('❌ 没有找到虚拟用户')
      await prisma.$disconnect()
      process.exit(0)
    }

    console.log(`📋 找到 ${virtualUsers.length} 个虚拟用户\n`)

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < virtualUsers.length; i++) {
      const user = virtualUsers[i]
      const realName = generateRealName(i)

      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            name: realName,
            // 更新头像 URL 使用真实姓名
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(realName)}`
          }
        })
        console.log(`✅ [${i + 1}/${virtualUsers.length}] ${user.email} -> ${realName}`)
        successCount++
      } catch (error) {
        console.error(`❌ [${i + 1}/${virtualUsers.length}] 更新失败:`, error.message)
        failCount++
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n📊 更新完成:')
    console.log(`   ✅ 成功: ${successCount} 个用户`)
    if (failCount > 0) {
      console.log(`   ❌ 失败: ${failCount} 个用户`)
    }
    console.log('\n💡 所有虚拟用户现在使用真实的英文姓名！')

    await prisma.$disconnect()
  } catch (error) {
    console.error('\n❌ 执行过程中出错:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

updateVirtualUsers()
