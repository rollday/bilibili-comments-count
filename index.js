const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');
const url = 'https://www.bilibili.com/video/BV18E4m1d7b7'
// 生成 R
function getPictureHashKey(i) {
    const V = [46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52];
    const N = V.map(U => i.charAt(U)).filter(char => char).join('').slice(0, 32);
    return N;
}

// 计算 MD5
function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

// 生成 w_rid
function generateWRid(imgKey, subKey, params) {
    const i = imgKey + subKey;
    const R = getPictureHashKey(i);
    const Z = Math.round(Date.now() / 1000);
    const W = { ...params, wts: Z };
    const sortedKeys = Object.keys(W).sort();
    const queryString = sortedKeys
        .map(key => {
            let value = W[key];
            if (value && typeof value === 'string') {
                value = value.replace(/[!'()*]/g, '');
            }
            return value != null ? `${encodeURIComponent(key)}=${encodeURIComponent(value)}` : null;
        })
        .filter(Boolean)
        .join('&');
    const w_rid = md5(queryString + R);
    return { w_rid, wts: Z.toString() };
}

// 主函数
async function main() {
    try {
        // 发起请求获取 imgKey 和 subKey
        const response = await axios.get('https://api.bilibili.com/x/web-interface/nav');
        const data = response.data;

        // 发起请求获取视频页面 HTML
        const videoOid = await axios.get(url);
        const html = videoOid.data;

        // 提取视频 ID
        const regex = /"aid":(?<id>\d+)/;
        const match = html.match(regex);
        const oid = match && match.groups && match.groups.id;
        if (data.code === -101 && data.data && data.data.wbi_img && oid) {
            // 提取 imgKey 和 subKey
            const imgUrl = data.data.wbi_img.img_url;
            const subUrl = data.data.wbi_img.sub_url;
            const imgKey = imgUrl.split('/')[5].split('.')[0];
            const subKey = subUrl.split('/')[5].split('.')[0];

            // 示例参数
            const mode = '3';
            const pagination_str = '{"offset":""}';
            const plat = '1';
            const seek_rpid = '';
            const type = '1';
            const web_location = '1315875';
            const params = {
                mode: mode,
                oid: oid,
                pagination_str: pagination_str,
                plat: plat,
                seek_rpid: seek_rpid,
                type: type,
                web_location: web_location
            };

            // 生成新的 w_rid 和 wts
            const result = generateWRid(imgKey, subKey, params);
            const { w_rid, wts } = result;

            // 构建新的访问链接
            const newUrl = `https://api.bilibili.com/x/v2/reply/wbi/main?oid=${oid}&type=${type}&mode=${mode}&pagination_str=${pagination_str}&plat=${plat}&seek_rpid=${seek_rpid}&web_location=${web_location}&w_rid=${w_rid}&wts=${wts}`;

            // 发起请求获取内容
            const dataResponse = await axios.get(newUrl);
            const outputData = dataResponse.data;
            const all_count = outputData.data.cursor.all_count
            console.log('当前评论',all_count,'条')
            // 写入到 output.json
            fs.writeFileSync('output.json', JSON.stringify(outputData, null, 2));
        } else {
            console.log('API 响应码:', data.code);
            console.log('消息:', data.message);
        }
    } catch (error) {
        console.error('请求失败:', error.message);
    }
}

// 运行主函数
main();
