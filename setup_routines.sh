#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════
# setup_routines.sh
# Claude Code Routine 一括セットアップスクリプト
#
# 使い方:
#   cd /path/to/Portfolio
#   bash setup_routines.sh
# ══════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JAPAN_MD="$SCRIPT_DIR/routine_japan_1700.md"
US_MD="$SCRIPT_DIR/routine_us_0600.md"

# ─── カラー出力 ───────────────────────────────────────────────
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
RESET='\033[0m'

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║   Claude Code Routine セットアップ                       ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════╝${RESET}"
echo ""

# ─── 前提確認 ────────────────────────────────────────────────
check_prerequisites() {
  echo -e "${CYAN}▶ 前提確認...${RESET}"

  # claude CLI チェック（なくても続行）
  if ! command -v claude &>/dev/null; then
    echo -e "${YELLOW}  △ claude CLI が見つかりません（Web UI での設定手順を表示します）${RESET}"
    CLAUDE_CLI_AVAILABLE=false
  else
    echo -e "${GREEN}  ✓ claude CLI: $(claude --version 2>/dev/null || echo '(バージョン不明)')${RESET}"
    CLAUDE_CLI_AVAILABLE=true
  fi

  # プロンプトファイル存在確認
  if [[ ! -f "$JAPAN_MD" ]]; then
    echo -e "${RED}✗ routine_japan_1700.md が見つかりません: $JAPAN_MD${RESET}"
    exit 1
  fi
  echo -e "${GREEN}  ✓ routine_japan_1700.md${RESET}"

  if [[ ! -f "$US_MD" ]]; then
    echo -e "${RED}✗ routine_us_0600.md が見つかりません: $US_MD${RESET}"
    exit 1
  fi
  echo -e "${GREEN}  ✓ routine_us_0600.md${RESET}"

  echo ""
}

# ─── プロンプト本文を md から抽出する関数 ─────────────────────
# 「## プロンプト（ここからをRoutineのプロンプト欄にペースト）」以降を取得
extract_prompt() {
  local file="$1"
  awk '/^## プロンプト（ここからをRoutineのプロンプト欄にペースト）/{found=1; next} found{print}' "$file"
}

# ─── Routine 登録（非対話モードで試みる） ───────────────────
register_routine() {
  local name="$1"
  local cron="$2"
  local prompt_text="$3"

  echo -e "${CYAN}▶ Routine 登録: ${BOLD}${name}${RESET}"

  # claude -p "/schedule ..." で登録を試みる
  # 非対話モードでは /schedule コマンドが使えない場合は手動手順を案内する
  local tmpfile
  tmpfile=$(mktemp /tmp/routine_prompt_XXXXXX.txt)
  echo "$prompt_text" > "$tmpfile"

  local schedule_cmd
  schedule_cmd=$(printf '/schedule "%s" cron="%s" prompt_file="%s"' "$name" "$cron" "$tmpfile")

  if claude -p "$schedule_cmd" --no-stream 2>/dev/null; then
    echo -e "${GREEN}  ✓ 登録成功: ${name}${RESET}"
    rm -f "$tmpfile"
    return 0
  else
    rm -f "$tmpfile"
    return 1  # 失敗時は手動手順へ
  fi
}

# ─── 手動セットアップ案内 ────────────────────────────────────
show_manual_instructions() {
  local name="$1"
  local cron_desc="$2"
  local cron_utc="$3"
  local md_file="$4"

  echo ""
  echo -e "${YELLOW}  ──────────────────────────────────────────────────${RESET}"
  echo -e "${YELLOW}  手動セットアップ手順: ${BOLD}${name}${RESET}"
  echo -e "${YELLOW}  ──────────────────────────────────────────────────${RESET}"
  echo ""
  echo -e "  ${BOLD}方法A: Web UI から設定（推奨）${RESET}"
  echo "  1. ブラウザで https://claude.ai/code/routines を開く"
  echo "  2. 「New Routine」をクリック"
  echo -e "  3. 名前: ${BOLD}${name}${RESET}"
  echo -e "  4. スケジュール（cron/UTC）: ${BOLD}${cron_utc}${RESET}  ← ${cron_desc}"
  echo "  5. プロンプト欄に以下の内容を貼り付ける:"
  echo ""
  echo -e "  ${CYAN}--- プロンプトここから ---${RESET}"
  extract_prompt "$md_file" | head -6
  echo "  （続きは以下のファイルを参照）"
  echo -e "  ${CYAN}$md_file${RESET}"
  echo -e "  ${CYAN}--- プロンプトここまで ---${RESET}"
  echo ""
  echo -e "  ${BOLD}方法B: Claude Code CLI から設定${RESET}"
  echo "  1. ターミナルで claude を起動:"
  echo -e "     ${BOLD}claude${RESET}"
  echo "  2. 以下のコマンドを入力:"
  echo -e "     ${BOLD}/schedule${RESET}"
  echo "  3. スケジュール名・cron・プロンプトを対話形式で入力する"
  echo "     (プロンプトは $md_file の内容を貼り付け)"
  echo ""
}

# ─── Routine のスケジュール確認 ──────────────────────────────
show_schedule_check() {
  echo -e "${CYAN}▶ 登録済み Routine 確認中...${RESET}"
  if claude -p "/schedule list" --no-stream 2>/dev/null; then
    echo ""
  else
    echo "  (CLI での一覧取得に非対応です。Web UI で確認してください)"
    echo -e "  ${CYAN}https://claude.ai/code/routines${RESET}"
    echo ""
  fi
}

# ═══════════════════════════════════════════════════════════════
#  メイン処理
# ═══════════════════════════════════════════════════════════════

check_prerequisites

echo -e "${BOLD}登録する Routine:${RESET}"
echo "  1. 🇯🇵 Japan Close レポート  ── 毎平日 17:00 JST"
echo "  2. 🇺🇸 US Overnight レポート ── 毎平日 06:00 JST"
echo ""

JAPAN_PROMPT=$(extract_prompt "$JAPAN_MD")
US_PROMPT=$(extract_prompt "$US_MD")

# ── Routine 1: Japan Close ──────────────────────────────────
JAPAN_REGISTERED=false
if [[ "$CLAUDE_CLI_AVAILABLE" == "true" ]]; then
  if register_routine "Japan Close レポート" "0 8 * * 1-5" "$JAPAN_PROMPT" 2>/dev/null; then
    JAPAN_REGISTERED=true
  fi
fi

if [[ "$JAPAN_REGISTERED" == "false" ]]; then
  show_manual_instructions \
    "Japan Close レポート" \
    "毎平日 17:00 JST" \
    "0 8 * * 1-5" \
    "$JAPAN_MD"
fi

# ── Routine 2: US Overnight ─────────────────────────────────
US_REGISTERED=false
if [[ "$CLAUDE_CLI_AVAILABLE" == "true" ]]; then
  if register_routine "US Overnight レポート" "0 21 * * 0-4" "$US_PROMPT" 2>/dev/null; then
    US_REGISTERED=true
  fi
fi

if [[ "$US_REGISTERED" == "false" ]]; then
  show_manual_instructions \
    "US Overnight レポート" \
    "毎平日 06:00 JST（前日21:00 UTC）" \
    "0 21 * * 0-4" \
    "$US_MD"
fi

# ── 完了メッセージ ───────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║  セットアップ情報                                        ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${BOLD}Routine 管理 Web UI:${RESET}"
echo -e "  ${CYAN}https://claude.ai/code/routines${RESET}"
echo ""
echo -e "  ${BOLD}必要なコネクター（Routine の設定画面で有効化）:${RESET}"
echo "  ✓ Web Search（市場データ収集）"
echo "  ✓ Notion（レポート保存先）"
echo ""
echo -e "  ${BOLD}Notion DB ID:${RESET}"
echo "  357e348f-3cc9-809b-8647-f4a87244d676"
echo ""
echo -e "  ${BOLD}スケジュール（UTC cron）:${RESET}"
echo "  🇯🇵 Japan Close  : 0 8 * * 1-5   （毎平日 17:00 JST）"
echo "  🇺🇸 US Overnight : 0 21 * * 0-4  （毎平日 06:00 JST）"
echo ""
echo -e "  ${GREEN}✓ PC がオフでも Anthropic クラウドで自動実行されます${RESET}"
echo ""

show_schedule_check

if [[ "$CLAUDE_CLI_AVAILABLE" == "true" ]]; then
  show_schedule_check
fi

echo -e "${GREEN}${BOLD}完了！${RESET}"
echo ""
