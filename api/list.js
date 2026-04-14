const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: '只接受 GET 請求' });

    try {
        const response = await notion.databases.query({
            database_id: DATABASE_ID,
            sorts: [{ property: '日期', direction: 'descending' }]
        });

        const records = response.results.map(page => ({
            id: page.id,
            title: page.properties['項目名稱'].title[0]?.plain_text || '',
            date: page.properties['日期'].date?.start || '',
            type: page.properties['類型'].select?.name || '',
            rating: page.properties['評分'].number || 0,
            note: page.properties['備註'].rich_text[0]?.plain_text || ''
        }));

        return res.status(200).json({ success: true, records });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};