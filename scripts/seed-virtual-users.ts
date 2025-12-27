import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const prisma = new PrismaClient()

const nicknames = [
    'TravelGuru', 'Wanderlust', 'GlobalNomad', 'StreetEats', 'BackpackBen',
    'CitySlicker', 'NatureLover', 'UrbanExplorer', 'CultureVulture', 'AdventureAlex',
    'JetSetter', 'TrailBlazer', 'MapMaker', 'PassportPete', 'SojournSarah',
    'TrekkerTom', 'VoyagerViv', 'WayfarerWill', 'RoamingRob', 'PathfinderPat',
    'GlobeTrotter', 'NomadicNate', 'VistaVibe', 'SummitSeeker', 'PeakPerformer',
    'ValleyTraveler', 'CoastCruiser', 'IslandHopper', 'DesertDreamer', 'ForestFriend',
    'AlpineAria', 'OceanicOllie', 'RiverRider', 'CanyonChris', 'MeadowMark',
    'PrairiePiper', 'GlacierGabe', 'TundraTess', 'JungleJoe', 'SavannaSam',
    'OasisOlivia', 'ZenTravel', 'MindfulMick', 'SoulSearcher', 'EpicExplorer',
    'DiscoveryDeb', 'OdysseyOscar', 'QuestQuinn', 'SafariShane', 'VoyageVal',
    'WandarWill', 'DriftDave', 'GazeGrace', 'StrollStan', 'JauntJack',
    'VibeVictor', 'AuraAlice', 'PulsePaul', 'EchoEllen', 'FlowFran',
    'SparkSam', 'GlowGerry', 'BeamBill', 'RayRose', 'FlashFinn',
    'SwiftSue', 'QuickQuentin', 'AgileAmy', 'BoldBen', 'DaringDan',
    'FearlessFay', 'SteadySteve', 'CalmCathy', 'BrightBella', 'ShineShaun',
    'PointPete', 'GuideGail', 'LeadLeo', 'StarStella', 'MoonMatt',
    'SunSonia', 'SkySkylar', 'CloudClara', 'WindWendy', 'RainRick',
    'SnowSasha', 'StormStu', 'FrostFred', 'HeatHank', 'LightLuke',
    'DarkDora', 'DeepDan', 'HighHeidi', 'LowLiam', 'WideWanda',
    'LongLogan', 'SmallSally', 'BigBob', 'OldOlive', 'NewNeil'
]

async function main() {
    console.log('开始创建 100 个虚拟用户...')

    for (let i = 0; i < 100; i++) {
        const nickname = nicknames[i] || `User_${i + 1}`
        const email = `virtual_user_${i + 1}@besttimeguide.com`

        try {
            await prisma.user.upsert({
                where: { email },
                update: { name: nickname },
                create: {
                    name: nickname,
                    email,
                    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname}`,
                    isAdmin: false
                }
            })
        } catch (error) {
            console.error(`创建用户 ${nickname} 失败:`, error)
        }
    }

    console.log('100 个虚拟用户创建/同步完成！')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
