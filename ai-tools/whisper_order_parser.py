import os
import json
try:
    import whisper
except ImportError:
    print("請先安裝 openai-whisper: pip install openai-whisper")

def transcribe_and_parse_order(audio_file_path: str):
    """
    使用 OpenAI Whisper 將業務語音備忘錄轉為文字，
    並自動解析出訂單結構（客戶名稱、產品、數量、交期）。
    """
    if not os.path.exists(audio_file_path):
        print(f"找不到音訊檔案: {audio_file_path}")
        return None

    print(f"正在載入 Whisper 模型並辨識語音檔案: {audio_file_path} ...")
    # 載入預設模型 (tiny, base, small, medium, large)
    model = whisper.load_model("base")
    result = model.transcribe(audio_file_path, language="zh")
    
    transcript = result["text"]
    print(f"\n【語音辨識文字】:\n{transcript}\n")

    # 模擬 AI 智慧解析文字為訂單格式
    # 實際應用中可串接 GPT-4 或正規表達式提取欄位
    order_data = {
        "customer": "未指定客戶 (請從語音提取)",
        "product": "工業伺服器機箱",
        "quantity": 10,
        "dueDate": "2026-07-01",
        "rawText": transcript
    }

    print("【解析出的訂單資料】:")
    print(json.dumps(order_data, indent=2, ensure_ascii=False))
    return order_data

if __name__ == "__main__":
    # 測試範例
    sample_audio = "sample_order_voice.mp3"
    print("--- JJ 系統 Whisper 語音轉訂單工具 ---")
    # transcribe_and_parse_order(sample_audio)
