const fs = require('fs');
const path = require('path');
const readline = require('readline');

// --- 設定値 ---
const YEAR = 2025;
const MONTH = 11; // 都度変更する

// 出力ファイル名
const OUTPUT_FILENAME = `交通費精算_平日データ_${YEAR}${String(MONTH).padStart(2, '0')}.csv`;

// CSVヘッダー
const header = "日付,出発,到着,往復,金額/Km,客先請求,申請理由,交通機関,備考";

// 固定データ
const sampleData = {
    出発: "薬院駅前",
    到着: "博多",
    往復: "往復",
    金額_Km: 150,
    客先請求: "なし",
    申請理由: "通勤費(通常勤務地)",
    交通機関: "バス（国内）",
    備考: "" 
};

// =======================================================
// --- 関数定義 ---
// =======================================================

/**
 * Dateオブジェクトから "YYYY/MM/DD" 形式の文字列を生成する
 * @param {Date} date - Dateオブジェクト
 * @returns {string} 
 */
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}/${m}/${d}`;
}

/**
 * 指定された年月の平日データを生成し、CSV文字列を返す
 * @param {number} year - 年
 * @param {number} month - 月 (1-12)
 * @param {Set<string>} skipDates - スキップする日付 ('YYYY/MM/DD'形式) のSet
 * @returns {string} 
 */
function generateWeekdayData(year, month, skipDates) {
    const csvRows = [header]; // ヘッダーから開始

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); 

    let currentDate = startDate;
    let skippedCount = 0;

    while (currentDate <= endDate) {
        const formattedDate = formatDate(currentDate);
        const dayOfWeek = currentDate.getDay(); // 0:日, 1:月, 2:火, ..., 6:土

        // 1. 平日 (月～金) のみ処理
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            // 2. スキップリストに含まれていないか確認
            if (skipDates.has(formattedDate)) {
                console.log(`- スキップ: ${formattedDate} (休暇のため)`);
                skippedCount++;
            } else {
                const dataLine = [
                    formattedDate,
                    sampleData.出発,
                    sampleData.到着,
                    sampleData.往復,
                    sampleData.金額_Km,
                    sampleData.客先請求,
                    sampleData.申請理由,
                    sampleData.交通機関,
                    sampleData.備考
                ].map(String).join(',');

                csvRows.push(dataLine);
            }
        }

        // 次の日へ進む
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + 1);
        currentDate = nextDate;
    }

    console.log(`\n 生成完了: ${csvRows.length - 1 - skippedCount}行のデータと${skippedCount}日の休暇を処理しました。`);
    return csvRows.join('\n');
}

// =======================================================
// --- メイン処理 ---
// =======================================================

/**
 * ユーザー入力とCSV生成を処理するメイン関数
 */
function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log(` ${YEAR}年${MONTH}月の平日CSVファイルを生成します。`);
    
    // ユーザーに休んだ日を質問
    rl.question(`\n 休暇した日付（日のみ）を入力してください。（祝日も含む）\n(例: 10,17,24 ※カンマ区切り)\n `, (answer) => {
        rl.close();

        // ユーザー入力を処理
        const inputDays = answer.split(',')
                                .map(d => d.trim())
                                .filter(d => d && !isNaN(d)); // 空白や非数字を除去

        // スキップする日付のセットを作成 (例: '2025/10/10')
        const skipDates = new Set(inputDays.map(day => {
            const m = String(MONTH).padStart(2, '0');
            const d = String(day).padStart(2, '0');
            return `${YEAR}/${m}/${d}`;
        }));

        console.log(`\n--- 処理開始 ---`);
        console.log(`入力されたお休みの日: ${inputDays.join(', ')}`);

        try {
            // CSVデータの生成
            const csvData = generateWeekdayData(YEAR, MONTH, skipDates);

            // ファイルへの書き込み
            fs.writeFileSync(OUTPUT_FILENAME, csvData, 'utf8');
            console.log(`\n✅ ${OUTPUT_FILENAME} を作成しました。`);
            console.log(`場所: ${path.resolve(OUTPUT_FILENAME)}`);
        } catch (err) {
            console.error("\n ファイル書き込みエラー:", err);
        }
    });
}

main();