const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: '只接受 GET 請求' });
    }

    try {
        const response = await notion.databases.query({
            database_id: DATABASE_ID,
            sorts: [{ property: '日期', direction: 'ascending' }]
        });

        // 整理成：{ 項目名稱: { 日期: 評分 } } 的結構
        const itemMap = {};
        const dateSet = new Set();

        response.results.forEach(page => {
            const title = page.properties.項目名稱.title[0]?.plain_text || '';
            const date = page.properties.日期.date?.start || '';
            const rating = page.properties.評分.number || 0;

            if (!title || !date) return;

            dateSet.add(date);

            if (!itemMap[title]) {
                itemMap[title] = {};
            }
            itemMap[title][date] = rating;
        });

        // 日期排序
        const dates = [...dateSet].sort();

        // 組成報表陣列，對應你 Excel 截圖的格式
        // 每一列 = 一個工作項目
        // 每一欄 = 一個日期的評分
        const rows = Object.entries(itemMap).map(([title, dateRatings]) => {
            const scores = dates.map(d => dateRatings[d] ?? 0);
            return { title, scores };
        });

        return res.status(200).json({ success: true, dates, rows });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};