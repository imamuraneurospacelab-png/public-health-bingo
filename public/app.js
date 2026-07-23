const QUESTIONS = [
  { id: 0, short: "再興感染症", text: "再興感染症はどっち？", options: ["新型コロナウィルス感染症", "結核"] },
  { id: 1, short: "腸炎ビブリオ", text: "腸炎ビブリオはどこに多い？", options: ["魚介類", "肉"] },
  { id: 2, short: "換気管理", text: "職場の換気管理はどっち？", options: ["作業管理", "作業環境管理"] },
  { id: 3, short: "病院の病床", text: "〜病院のベッド数は何床以上？", options: ["1床", "20床"] },
  { id: 4, short: "労災申請", text: "労災の申請先は？", options: ["保健所", "労働基準監督署"] },
  { id: 5, short: "世帯構成", text: "最多の世帯構成は？", options: ["単独世帯", "三世帯"] },
  { id: 6, short: "保健師", text: "保健師の職種区分は？", options: ["業務独占職", "名称独占職"] },
  { id: 7, short: "健康づくり", text: "WHOが採択した『健康づくり』の国際文書は？", options: ["オタワ憲章", "児童憲章"] },
  { id: 8, short: "喫煙率", text: "喫煙率の高い性別は？", options: ["男性", "女性"] },
  { id: 9, short: "イタイイタイ病", text: "イタイイタイ病の原因は？", options: ["カドミウム", "有機水銀"] },
  { id: 10, short: "介護保険第2号", text: "介護保険の第2号被保険者の年齢範囲は？", options: ["20歳以上40歳未満", "40歳以上65歳未満"] },
  { id: 11, short: "要介護申請", text: "要介護認定の申請先は？", options: ["高齢者施設", "市町村"] },
  { id: 12, short: "虐待類型", text: "食事・衣服・医療などの世話を怠る", options: ["ネグレクト", "心理的虐待"] },
  { id: 13, short: "日本の総人口", text: "日本の総人口は約何人？", options: ["1億人", "1億2600万人"] },
  { id: 14, short: "ブドウ球菌", text: "黄色ブドウ球菌の毒素は？", options: ["エンテロトキシン", "ベロ毒素"] },
  { id: 15, short: "診療所の病床", text: "診療所のベッド数は？", options: ["20床", "19床"] },
  { id: 16, short: "医療費", text: "医療費が最もかかる年齢層は？", options: ["若年層", "高齢者層"] },
  { id: 17, short: "死亡原因", text: "死亡原因1位は？", options: ["脳血管障害", "悪性新生物"] },
  { id: 18, short: "後期高齢者", text: "後期高齢者医療制度の対象年齢は？", options: ["75歳以上", "20歳未満"] },
  { id: 19, short: "出席停止", text: "学校の感染症による出席停止の根拠法は？", options: ["学校保健安全法", "学校給食法"] },
  { id: 20, short: "出生率", text: "出生率（人口千人対）は？", options: ["6.8", "1.22"] },
  { id: 21, short: "運動習慣", text: "運動習慣が最も高い年齢層は？", options: ["20代", "70代"] },
  { id: 22, short: "陽性症状", text: "統合失調症の陽性症状は？", options: ["自閉", "幻覚"] },
  { id: 23, short: "粗死亡率", text: "粗死亡率（人口千人対）は？", options: ["11.1", "1110"] }
];

const $ = selector => document.querySelector(selector);
const landing = $("#landing");
const hostScreen = $("#host-screen");
const studentScreen = $("#student-screen");

let hostSession = null;
let playerSession = null;
let hostPollTimer = null;
let studentPollTimer = null;
let countdownTimer = null;
let countdownValue = null;
let lastStudentQuestionId = null;
let lastStudentLines = 0;
let lastStudentNearKeys = new Set();
let celebratedRank = null;
let answerBusy = false;
let toastTimer = null;
let studentAudioPrimed = false;

let hostAudioContext = null;
let hostAudioUnlocked = false;
let hostReadEnabled = localStorage.getItem("bingo-host-read") !== "off";
let hostEffectsEnabled = localStorage.getItem("bingo-host-effects") !== "off";
let hostSpeechRate = Number(localStorage.getItem("bingo-host-rate") || "0.95");
let lastHostQuestionId = null;
let lastHostRevealedQuestionId = null;
let lastHostWinnerCount = 0;
let lastHostReachCount = 0;
let lastHostBingoCount = 0;
let latestHostData = null;
let japaneseVoice = null;
let activeUtterances = new Set();
let eventAudioPreparePromise = null;
let activeEventVoiceSource = null;
const eventAudioBuffers = new Map();
let lastHostPlayerStates = new Map();
let hostPlayerStatesInitialized = false;

// 音声をapp.js内に埋め込み、GitHub上のaudioフォルダやキャッシュに依存しないようにしています。
const EVENT_AUDIO_DATA = {
  reach: "data:audio/mpeg;base64,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MKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+0TE8oAJbMUr7DzAiPCUI/DAGIGqqqqqqqqqqqqqqkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE9wNDqGsQIIBnAHMAYYAQAACqqqqqqqqqqqqqqqqqqkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE2gPAAAH+AAAAIAAAP8AAAASqqqqqqqqqqqqqqqqqqkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE2gPAAAH+AAAAIAAAP8AAAASqqqqqqqqqqqqqqqqqqkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE2gPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE2gPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE2gPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE2gPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE2gPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE2gPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE2gPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE2gPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE2gPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE2gPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE2gPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE2gPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE2gPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE2gPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE2gPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE2gPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xTE2gPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=",
  bingo: "data:audio/mpeg;base64,SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYxLjcuMTAwAAAAAAAAAAAAAAD/+1TAAAAAAAAAAAAAAAAAAAAAAABYaW5nAAAADwAAADwAAC9wABAaGiEmJiwsMzk5Pz9FS0tQUFddXWJiZ25udXV6f3+EhIqPj5SUmZ6eo6Onra2xsba6ur6+wsbGysrN0NDT09XX19nZ293d39/h4+Pl5efp6evr7e/v8fHz9fX39/n7+/39/wAAAABMYXZjNjEuMTkAAAAAAAAAAAAAAAAkAxUAAAAAAAAvcF6UFowAAAAAAAAAAAAAAAAAAAD/+7TEAAAAAAGkFAAAIOwSZHcpEAADgUDAUBgUCAMAAAAADwMmtBFS8AIwAos8DEkwLB/AZY5H6zUjvw5QLeBCf/yTImxud//MiCDsL5v/mIUHg1g2gHkXcPxsHEUgKAD0UfKc/au9TMDEl7TzNz6YLAMpgFAA4ajuOomHkBZJu9IWOYccScDQAYy4wdcAyMH0BjDERzNEzWMAhbUhABzFjRHMxE0RVNE6IqTEjTLUSAE5eYmqEqmTlD7xiHgN+aRWKRGUoM5JlozrSpmxNY5iToZGZO4NNGGXAbBjmAl2YacRomEbjEK5X5WgYC8A5GGMh4ZiW4mqYd6DNmIDBwRgeonMY00PymKeCJBh7Q3MYVkKYtJisIfOUGDmAGBgtoJCYqIIvGHTBjBhLgIsYMSCumIwCmZiEQgKYKYEdGAshBxhYgK2FQKvkGT0TwyMCfAuzAqwEkwK4CSMBwAQi2JgWQFEYEoA8GA7AH5gjAPcYCCDTmBdAV5g2wJGYHqC5CECCa/ORWkqwZAoOAODAHQB8wCUAtMAlABTAHgBowBwAeAwBYXkMBsACDADwGIwHYAbMAQATCICYMA2AZyEB9CgA5Fo9T01WY5svA3krduB/iEUl/QUAhFABPEonlGWXv7R2otAcTv7p9IAJkIIAARAAXEPgANjRsUlA7ixAiEZ0giZUltF6B141GX2V8IuwHxnbdwY0ZujvmFNuk8HIp2ZVtTdOrzrkWo1aR8txYAvy8RHFnZ5GTL96OvPm1NB/tj/+6TE+AAzFSdJ+f+2Afueqv+y8AW0TV9Z+8fWPSsGSHuJCfts9d3jxH/j/FK7zattYrjMeZUTmP+/rsx1sFa5oyAAAAA+DBjAs3Y0ZHcZQUvskEAZCYIAsIv9YZxnKWXS1YZtwzADrao+l0J2xZxocbE7BAqxLyTU8EQ5Z7hd5jZq9xlcpkJFCFxntPT1F/08SBiZ1VdXkfJapc567d6LP0kitAwmJTDHXnzs8b/nLYkOgJEkgI8Ti6xpXqgB19XAgQAgcA6pUFMlMjjIiMENoHHwUPaYsAhMaW69pVnIkmuNPBmlmT6a0xB0Jy1IrwnwXryIfgLNBuEDc8L322PppwWVVlHJiIoSempcKvAxl7RL/9Y/idXoqhxgFBmR7nmWC/xC0o86UHPySnJG3O7FOoCo8B2hTnDUMfm1vMyGMQ1skQI/BI0vKGGepJkks/0kl8sIW4JQjGRD3ijm6moPwj2+/xnWNZXcV9Q7on0q/vGyYWRxifijNk/c/z5T94fXIHHqRMuNPo61frP3FJAz16t0BgBgPgVCA6EoADMRjAw8JbkIypmSQ0iQPpoygT+05rv9zo/1nXu61mWBWXq1RmtRu9BcvizSBSRxL1+vynw3frjoNHK+DI9qFvTBV7b/+4TE0YAP5PFV7WDN6bkZ6n2nobjoS8Rh0JqyXbxmSZmPuefa8fHLVRg+IEAcIAVORaXKRx7FObaxf9EAAGOHkgAAIC4f0LhQgSfGqEaQw0nqZcUYMCztOiQMiY9MYtynHYiLsby3Vp6eYeAzIH6W7EoOf+NLzj6ZaSp8zo0q1yloUBY0zd6G2W9RqWiiqMuNHa5IVQw/GBEEpyWXnCsUG0FaojtCz1HavOK7xkhehLyy6JANwdEcfRHA8MiUOpUIrkwU6/Vmb8/PPTS8Bp++/SMAAAsu7gE2QA6N5nk6GI4cIpOBkgLCC6hEElt1gKZ/IYcWMUecA//9qZQ3QGEh7cI7BEZoX7cWkYKo0awBQUvSUtRv0T9OBF7gBAH8fMLAQk6w5ZZCs19XaC4rExxQhxGcszvmjMbbzO8WtJjOoqwyRmRPqOU60TUrVEu2NUL/+2TE+AAMYNNj7DzN4eOa6z2spbxFD30GDXwP8U17HNLTczCDESdInPjlUDCGrJQEAIDOGHCACzowUIHDhIE8QGHhUEi2nk81SHFB3SdpkawjkzlvWNzX1INXVI3vmM8NzGciYUDlwVYq0nctc5YY5MXGEFZILopbXqQauqTK9aTI6/KsYv0vbN7n0/87/s58RkJce+jJMZIKvK2Q6OigUtLdIAFFkQAAAA44QBT7nYqos6g4VLAmZ6dBhOtdiksZvJpc6kHtxcBtkhy3FLXlD62o2sKLODOUzolirJCX8m0sCEPNvGF7pQsJZa/8ANv/+3TE94DSzOtR7WWN6kyf6rm3j5Qz6lbQYA2Yg4UAQ2GSCsKY7SnyRNEQCEJDlFALTRuBcu252v81QZ6YXsdtdtrkqlc4w2NgP8vKqaQ6FKii8Fcp15xY4eb/eKXzfTEpkdUo//ijAz+qAABZt0ICAGAuMiwCX2cLWJG0FodHwIQUDAgyBQzWQ2XHKPRrt+Ixm9nEpN9I0YvvAdLUpI88DeRtqayQNofR74D1Gu7ps3bQqbg4g4DJoEMQUvu3BjAC9syIaPE8k8xXhuVm6RVvHs9hWYrOSiOKYLmB0ohgiQFg9hnfNkAuFoeUF1ytPRPKAA6TDACABAfCwQKBgsBATABwEAgkhCDIRclBggtDgZjy8WLTNM3Gmztxrn7qO1//+4TE6AAPDM9j7WDP4oQjKjW3i81dkYGma2rTCIzDcgiD8NBLBggZfiFNhmaOvK6k0xtPFbCuAueJqqGLmdSVStvxaqGBD5y9JBjYXjJR9Ccu9iblxXGbsULU8CEpESoSKjPF1FQ1dz5c3zLM9pTF7Umzike+Il9gE4ArXr9VIABmuXUAAEAOHZC4VBU8ckaYg4M3Mzoox4FL8SKssaChFGaVQKI/BMOUer92Q6oEOo0Ng1oN6rHZfLaZp4jADYJikieuG6eKTMVhUdYJBUsFXLTY/Vgd3oWn6q6EAZAYTwZunyERD1+Bo9YXRW/P99zru4jjoXgiEd0/TEMTi0YIbbeNdF00ngoSR/AgLA4MMAF3mrcEAEA+K4iDcM9PRotjj8hlhFAsAsxyUJ138ULamKdrNcbEejOXKsFoGQW4q+5fNUdPdf5uQG/ahqIWb1r/+3TE+IAQzNdZ7T08ImQe6r28vb2k5nxwKGOBZEM/G4nlOw5G6JgID0mDLVpyTYX/ueG3vn5YlCuXQDNQOKMNnSMXntvJ/gy2Logs7IGFgBCXmYQAAEA+ACEASFRYK/lZkUyqCAgUwwppAcjVrZ7Gr0kXPLtN3sfqP1sdbeFjLSZUsSXWb7eQ7JxwkgGi0zVoaDCfh6zBL9xWFEI1KKdltaTU6i1I/AMg2CQHE3GirtqXVVFWtTLwtocEA6xpERfGNHGuLjI42MLiJN8/l0AAaJdUAAJMFxSlJvbIkdVUiw92ByMIHogISF2vVHewVL5t253vZZL8dWMVcTMwDQUgmXrXi4d0cOE1Onopuep84lZmYFb2B2ml3pqH67u59ev/+3TE7gASAPFV7TBcoeoea32cGbxrU68q/K27tvDefPr6xVLaz5V2WwsmWREqBI0GijoDt1eevn6VFU90QUV4L7bvrB+1kABUZ1IAAAA+FrBQpGzwKyZOqqSgzDCE9Sgcjit1oXYHhp/YAl9SAH4ywy127BjLZJGWYtda0mALf1ToABxEXkaPDMdlVfluep4wzaJtLAB1ThldVrNPOQgoAv+xB1p+m8Paz+19b8N8qn4NWymouIS5EIhARBsAiA612JLzYdO5OWa8oJSgw3q67qivlFRmzAhdMmWAAX2QZeg0OIuINAogAkIccS+UHtuw0mCb+3dm5bDkDVotlSfrJQu1dvw69T/SS/mtIaMzs1eg4fuWHztDrGGC7PNGKe3/+3TE7gBP4NlZ7SDcYgofKvmjI8WtrpF3AmA0bmSSVtu0Zrvf30dr5kpOzBNmTekDx5U1rjh3t2JYuKKKtlSXyeFixqpQE6XPtAYAoNAjI4QbuFb6SLmkgBH4t0rEtFj6xGhM2jMgemxDMs3zdnHmNCyikfPOcrVJnKkhsOH3YpKY9lzHxuQ2ocwu6DZGpj1AayTWJ8PVuI0xG1y7a/Zcz/ezO8XatRLxUDj5ssm7a+xjft/5i5bNKhLMVfKQAdJeSoIAAF8SokAdI8uiIJ7hkRBCFVCsp4FvPy0Nq06rFS3JiJ0nN5/+UQWrFXv1dzs0leSspLVU9mL0+6Gewux6XwbUFRX+eiDJ23I5toFUDipnKw0i7fi3Gl23b/nSccz/+3TE8oBSCQFV7T08KeOdqzmnrw2wMBPgltyNWERt+sLNWT3Vp+7/0ZswQYKplyoIgE4sKmaAE5CWgsa+4mWLPPWwqotldTO5hta96nb/uPZ63qlW0W/WHYtDd2SuVdtydiYQo7FLTKNqJ40wWqQ02thCUFvXz/V8azeQ1aE+ck/K/fIpZ1HvTUN4jPLNjzX0mhOEDTDzAqInWQ+7//V31tL0WLhop7BQgQGWYdQYAAC4lIyFeU4h0HCQ5UMlQceMiBVvh8mIIrT8NWGh3rluRc+5EdZ5QQoNH6d+dU01nSstLgqlhl44vTVGb6u36Clpmwkw5wIDl1PydbvTRoBEcQUraUtcy9fGc2GpvhqjTyYbBAo4tkDZMztuZvw85d3/+2TE8wAPBPdZ7TzYqd+aar2WG4US2Otf/ILlKiBAhKt1AABAziqQBxMX6DlwdIQHgMwyA6Qsq6q7pasy+3KX08zB+tSvfP3WafHurATl6VwLdaQIhyIzBvMWhfiOa9ZqTykbgIgjLLDlerSyQezlDjLpgiyPfCvJvdftEKZBnw9ZdBJKV2D4CtU5PaNb6863+sywKhLz23l+uBhBVcsIAABfDJjHBXGCTokKDhcOg66ENCUIi9nKHAb2eYbPVaRqV/VjLW+R9yqa+68huzim8afQcCo/2G/49TLRa2HSErjQ6hQMkpwwXCxClxYEi3X/+3TE6IAP2PtV7LzYofodaj2kG4W+Leq4GLwt27MusjQ9cHxFPmRahe5u+ZqP4WZS3ayM+sY8/NHuQBHmrKUAAAA+KhIKmjhqkCUIQ4ExUwQARAiIfFYs9TN4RBLf5xeRdyww3/4tmxo4duypaAcapSDA0zqKHbu9wm1q5yO2YxKF+XN2YzMxmEVBQHEL8SvLqoSvwq662VU1+/7rDNp49A5unNXcfzCL2Tr6DbfQUQFHFvcgwZxEhkQ6ZuNZow65ioKGipkAAcQCwtWtjqy3HJaXZmOsjcGD9Of1APYd+e+0xEqFtVpfngvMG821blbuTyqJqhExFQ+cGGDlkTraEIiDmb2uIviaqYlXGFXNF0tUUckUOFRo7Vfnv5YmIYX/+3TE7wAPpPlT7LzYqeqfan2now2kIc+kkl/y/cB09v/5SklucBO4SLjgNyGQAACWEkrwSUDjECnOZK672QO7MPSt/oXe3Xva/c2wZ9StdVnirDgHhT53WP4X7TDFSITyK/Ss96pkXPEdJrSI25q7+Kph4oVWhchuyCtCWu2qlqq/HW3JbTceOe+9MghaubVHAQAZwjyYM23EwO8MCl6iqSTWTJS/UDhTSH/U40aSNeqdUTQnODF8hsmo9RsV7e2pFMtEPpCix8P76jVcHzeG3p7PTEJtw1gN7XHv5ub8aO3afCjVHfGgcTfYPK2Hd2aMb567+piVNEpGfxjX1XBEiKy6LKJJ8BCQLCyswIg4YMECzAQmJBxFZisbJ37n8IT/+2TE+ICOuNNV7WEt6eEe6n2nob1JGM/2t/DfQf8t6agsiTa2K2cJhGEPc59v1InmmsO8SPo7KyVhtT2Z/EVdZ7VxmnhXz673JEzqnd6mhY3qu971Hrm2KV+8/63f+X5gQPl2ebwIAAAB9maYVAjJ1btxbGSAADEAyIFTBqxJiyIuzGtTYDCGIUYg64plxgKFG2BkIIxyQrCLAtKUMLAJiCAYiXJvs1mlqtMhwFJqMsuoAFcl04JuAEQ5jAEwqFbHofSUGuUrFqQCDRTaTTMMcNIsRjh0ZgoBeIhIkkLfliQiZAwL6vtDirkAzVHcijX/+2TE7wANzQFd7LEU4ccfKn2nmbz39lM1chrGY/WMqq1nvp7bLIppnb7w7T5WIZzm/dqXPbR0nafUjdyMTj/v/Pv5ll3Xf///Dnf////TEbRnb/xd3IcsZgEBIIw1Y2MFEEy8ZA0K4AE7wcmKhVgQWbnEEA4szUiUMTNaRWIWbAXkLizIMSYcj+2gYiaMuRnSC5gHxxxBljyy3hjRfkvawBOuHTOgLzmN4gFhoxQd2XAY8y5Z8DMmbkuxZ6tDMFzIpVodgNjkXmoo47JHHXezGYd+BI01X5S6r0zNZ4JfDrY4m7UCxCcm5Xambrk09S3/+4TE7AAOePNb9ZeAKzSlaP81kABUdyzEXzcSCtV7OqbHOJP8+dTOU4yx9WEtLdaJTlbf99wpPNS67l+P+3JicarW5m4HySG7u5ARBLbeDKBSIhSAhgkJhi+IkJBMju4iYKsMFSuvJnlBzwe6w4KQnxQGbusPriKc2aIyrIp8oiqsyYx+YTntVS8+qw3Id1eWvMd//madnkxKO9ep7ZYSGASKiJYM/O3Bab9AhAIh8LRLWkSF4DtzTotuYnCx4Dbds1h527KYJgS8tpFWihFbJ7bX3iyqMy99K1ezzq2tYv4cBZC2frwzOFEb0cladVfn7r/5nz1+/z749UhShsk36vl/vmOSpFrxkIQPeTcNdqdfQAJZxI0ACaM4kh+8XWYnBJGyDREIAKjA4NrSipMZgKw9M3cJK+eqr7rnV83tPg+Urku8bL/et6384qtxYx3/+4TE6QAZBSdX+a0ASYYdLD+wYAAObPFrTN4rw2NHyWtIWJbwJ94p5H1oy//P+zR9gZY2jyckkU6Ztzc77D2Y0oQeCLx+haqgAGASkAAicXy7Y4tZiHYHFZwQ2IiepdHxGkPO7QeTiPURq/cpo2o2qR4ubXRKpSQizSYaXn+v/nE7KwSENdFgfeLq2tN+wNAgHYPnxX8Kn33eZPU7c4yaKBWeQBkjnn4qahXbm5cYkkmjMN/gw1AARiQm6oAAmcKqgxQoBezGhoaw5lyLpepICKtlKBv2BjSqkJtpsYqQmzF7Q65+dQFGL16ZrlTH/x96xz/daK+Sla1rnfBVpLKl46muv7qv/cp3F92goxMzHSsTYteOpqtps97u305WT157PZfuSpIAQgBYYAAIzgKCA9kxyQ5GHyh7oAVCF0Eye7hJoOfKBpGU0BHsTGvMrc3/+2TE8YANOPtdrDDRKcGd7D2Hmfx+XO59/OKLlAK8kUe/1j4vjeGNUKUca1M91jWPqEBIQgUisWlRNfX+8VpP0vMKQHdhOFVPEJ1iKeE5o8fNj4WccCp9+MSYcQBhA1hQAChOIeFhl0GLKpkxpaMWRaL7K1ziVUtU6QfhiG1rSqhqhOP37Gya/tjdS/MA50ruua49/n5XMBFkTFhfX+q+M+KB949M/Nt/5rw0/f2du9Xta4k0mDLBFsYjDtjKc7Hy+wf/IH51gABwAGQwAkQuFFQgoOLUtJTSZJtzFlMYUgTHjn/GEZlN4mOry3KPY2b/+2TE8YANzPdfrD0N6big7H2HrfXcJvbVcwvXnjW6+RLSBVvq8193rA3Egu4YG8XGUWlxkkcIl36KI0dquZY2pr77g+3Nu9nM/u2eGOr5Nr0J5xC+2//vPQ8lqFEtU5cMCf37DukCTmIMIDCoAGCVxDIsYDxFHCwiUJXDISXkIkSIOHxUqaU6A9TswnmztVmIrc+zPqNn+788WMI8xNl/ix7g7CNogCCDPAyfNS8mmqJNsUCHLx+j7/5r2PlvDdsue/mCo6qNRNMEzsHnt47fSZqYaCTZVAvw1PKAAAAAISAAAC4R4OI0221ZRE2bYIL/+2TE8IAOIPth7L0Poa2aLH2Hmf2AEO6sAUCHu0jDuZgQhKVFTxQvX19HP//+t+v5EIs7cAvKMgjTrKVfR/PHOzFEniqwl4c4IlhBAu1N6PV5VREQA9QJCfK7z826+7My7N5v97e/y5YfBQ8CC3BKUKFzlc7q89NZa+kcxx0tDk3bn9nU2AzSAABOEyjRDM45lSvCm9iJvlOSONRlDwevtO80izEC9l18J7v/lbz3j+G2w4VSwHBzM3yubt3L+HdROALSfMXATyRa37St0ujsWnqNQxM0p3zu9W0//T8PbX8hYPjgXHokwPKqfabOzWf/+3TE74APbP1d7LzP6c0dK/2Xray7xMi1lFg1Qh5R7u5z1YIAAwAHcgAkbhJU2uNs1sjCgizcQMmdV+vlwyYcjpRv1hHjrDlSNmu4cRTY1eX0TDMX11J/b2/ppvcUsUy9819NaPTRgMznb5uK7vv9rP+GQx9OciioHouMUZ///9KW6bZRWbZyCbWnMIIIAAgA2UAAALhOk0kwIoWCBDICkEeDQPYuBC2okIJdNz4khRubOn17jZgkbNwn3xi1JTpuI8yMFb+bE1Kx2U9IZJx+6vXWXNxfvh7Kq6FR9W98/3z3MXER72v7qkBvPhmH4eVaapLrZxzOekXJJKk7/KqVchEUMIlQAijeFciOaVKmjEw7KNwyynRCWu/EEL3dxx7/+2TE/YIQtPlT7L2Yad4e6vWWD13l2NSGSmZYIRLtA3d/zmKyQBpx3/F9wVJlQOm4irGlmmmDBSYuvu//iv2muNpi7JGE0DYo1tarif+z1AgISi99COQCAO2AAQDw7Q+MxLWMxgjDbPMWKoeN88g6zNbYdqXywvjPNaPvrhBYfQ/NjDaTJGB9C9iRt0+b0tjaHL68A1M5xwZqYpvEU/SDnjAV8C1MzfOq3VMvD/F/b+MKCQrEYRQcte2Xm+kOqmcmrWSnv6RoCLLCAEIEUkABKB4MSwhBpBcUeHkvIT0ViKsBZbOxGmPoFkmZi3M8E///+2TE7AANOQFd7D1t6codav2Xrfx4pCZolbe0HOLkNnBtrObXrNSbGNSzPAkhlJl5ekk0CSBKRQMDtHQl1NVdW5WWettQe/YxSNr6o6TnSpM07d/2dESxYXe/bn+KRRZIAQQQ0UAEEPhKkJFNQtl74Bwlse2SuIHB4aBxERtWVx20dkhEVJlNGgWrBxHYc1xeOmtCkMrfr7xu0LMmnGQhaoN/FdRqT3twEwpAfx8ff30mvE33FS++roDWCg5Y/btdHG/Ng95trO4S4gI2IlmEA03wCQgoktNLbSMDjhFI6QECBjgi6tyUuvqVshyqg0n/+2TE6wAMIO1f7C0RIcqf6jWHofy2hnSsb2WlyV0gzIxXr//5cCB6wejL9O4LHQ4kIzOtk+r69GnvnGkhHHxHF7kShAvzr10RyIlRYtxvsmRkwIUzCA2sBDyF5kPEE0w6KbzCmaJ7MTLzLen6B7YtH4G/9UkZphVHPrCcKHsKd27f/1Jg4MIGNj/t9UEjT03VLf94+lLWR0R9jnIC8LGGD7n6lnTKCBXFauQSRTSJjgBt8AKZBNDaJnZKVnb9hG1OBG8aC1VM9qc+WupqiTV6ACGuyiZtNFMwSQQeWtHfz//1pG5wtM+vn0cXmSZhb5//+2TE7oAOOOlT7D1t6akZ6n2XofWqr5+qX5aGaHprKGDgFSRNZu1/X/lXcQzwxdg0WydIJGhBNQyCWcBEj4UnA2YUGPbUdL2uWWQXOwtU0LiDQcdMulT/kzKyCl44r/WwPDqY4mj+X/vAuOgQxZDZiSnIxOYKrf1H/3dNcU7SqqbrMjFDgMig4e0fHf/nvk8Vj937hgFCJKmAUW1wEVTPIWAhq7SBy0S4DpgES34SoFStgVPMU8CzrbG8qLqTCsf9Eo4N6C53qJuPRHlAP4xOx19VnqBRzX6MT99zmsPaex2CmcLaBwwh3K//xlCEAGX/+2TE7gAMDO9d7CTxaWeZ632DHjQzBG5i7+e6HJgWVIT214AiOC7B+6qd6F0nCr1gQpFV0bbDuaalvFWo83X2my2n3zj//LrZPd0+v86xvWZ7i7l9UJNYuIU2Kv1MPZMs1Y2pvvzW+uPmI3mJSCm0GnnsC2BYUeYuK65hKlaGXeudVrujYcQhqpAecfAZSgNRIohHiGT1gsAEJF90S5ehypmwBl/l65iibgeOsfk7/eWvD1UX+63U5p5UBwP9AZVRM1lkR22KBHPj9HxP817Jn4b011v5hSlS5ZRWovnj/02g4RLSceTuXxCJiAZiWAT/+1TE/gAMfP1b7C0RoYSdav2Eoh21gE5AckBrbkQJHnroC+VhDFYmO0hDW89QRXiSF09UQt9LS5Uz3PPjiaEMNjlVs7MzM9j5mRXw9jgmex6jAfyZP9X//+v7vLXecg8PGBw2hZDGj6/v6a0uR6TzpN845jI0GrqqAY3wCEg1YTaQa+3pEk7JcZ/yQp207FR/bblGowOLkKtSW7101fJWBMGRDEu6v/52gogAtGWj4sDhTDBo4R2euVP1yvKQWID/+2TE8QAMNQFX7CxxqaUeqz2Hof1hUBRIXHp7fisnUr27b3u0MxY7m7YI7XALyma4DUcBBEEBKYiUGDQy7LOw5K3DMFssgV3MZlz7+ehKr4AN82esmqBWdf/7/mLumPff9/5TgIMggLyFZGjkzqOn3+qX/oiPTQSrAuOFW/oGnQUDRmpFpSNWSKuUKm1wI6OLAvk/hnSai+A6sYNVUwxUI8O1PMn1MthrZrksyBRB9RevsUG4D1Qz89JhiKMDJwPh10J+pvZRyFAuOnmvrn9Tnpa91mFkG7hGKix8d8CrDSR6klUOAiBE60xBLJwCaoL/+1TE+QAMmOtV7LFsqZSeqb2GIb1mXBa4scHFEYFfUqVSMUCKxSuxCKeZi28Z3Kmu6lD0oseNcFosJelHQRiYoB0mbo7ERGkirKNZyK3o3OXRDlQ6jcNcUubfWCwLOKhBUiqUEUU1aX4ALYAop42kYeVSs7i4ctTgQvFitVTPanIwE6NUjUsJiezypKuo6VFSFGMFpEH9dfaPDcgLRezZuViEseUf9tdpuqI7lD2Oesk4EVWJMmXoqpQM0MpmISX/+2TE6YALgOlR7KSvKYKZqb2UomwyAGmHYJGxTyhpENWUGBdstIQcgYOZBogJl7IZSiV5ZxSEk7tP+GwPDqZhNH8//ydIzFF2qZurlNTi6BDHfDJfP/9vdrJ7cbjny7SiUOoGQMeVRXchQiW6kOO7ABdINAJAQ1ZUHSaSkI+5d5ochWGqwQqeUU7+vy3xvKi6DTA1//SODegud6ibj0R5QD+MTsdV1WeoRLbe2J/3/CsMmns1gpnC3A4YR60frSyHBgU1BT1rADLXmEx7TvQug8KxZiIDqujbYdx4ps1eu2F9BXTdEfXzj//LRsnu6fX/+1TE+IAL7MtN7CTxYWQZ6L2DmnT+dY3TM9xdy+oSPGLi1N1fqYKiKel1Ld9R0676ZEdbYhJ3y8+41yE8Od9SlUOFE3iQJ7qAFqqWi5ISOzFhxIxWac8Y9OH1Fq0EKFWrULdZo0JsmYIs7F//4t1d8b/9vatqxpSUKvklgtruJqCrcHY0x1Vj+2f9Z0Xnc2tXZ37IVFCQQMiNVfqVYO+hmAGgRU/lZEQFIlsQEM3IBhiZ7AErePUJn0xFE6rLqdD/+1TE8YAKuNE17B0zoWeZpn2HpRzvWc8eSwRw4al0/xH1B8dY0rgZXSnqDzEAPFF7P9aV+qPmI5HEFAhFhCMlFkhsC9YAGSMPASIfe0iE1kygjZIJrZAIN/xymivJMzeJtXHkwcC0OVLqP/96w9IB3GVMQPqRGE4kQYSZPCtVLKttP2vKxVEMhykh19tCqSlTZawTGQA2qtxffQpRDZTETBSIllxWHiwrcMlkJIdyZZe47xWK+6GFyARPT32YqWP/+1TE7wAK3NM17CxxiW8ZZn2Hrb3BKd6sFI4pjup7/a1jTDtaTD2ORaDYJfRLn9ex3owA3rPQbhR4hA6iwASGMGRqu0G1X5XwnIhVzP7paliBrwrcQbhaq/442gcujAKcGxd1X/N7LcgkOKh1bv+0puLqP/+dd7LGPa6SbUlqLcYACBoXSYCrEVODiiMCzoiDUItOoyavYZRUGVneJ1UYP6xhYCjjfuIaAbHiQF0esPD0aLUw2lNgtDqbRYkoRCz/+1TE6wALZNEv7DxvwTMY5TGFlb38iq/uBuQAEpkhUMEOaaXAl5iRssMp0ep1FJpl4RYENZ1PgVoH4EWiVmb64ejTyMFDFzFehMUfToa5krc9/a1+rZmkaKmI4Ceg119SwzkZ19RR2AOo44iZM3Q80PmMhZpThEVQWA2te16COuTv/q3eus/+b/gAEqpsZYhAg5BB8GyCpHJmBvn9eHSEIC1FNLgRaakksLr2AxImIMcbV+MFlZCpFMoMwmzwa1j/+1TE7IAKKMkr7D0KASIZJHWDHaFeku1gI1zwydSS78mIoWUEQJaSMWpgZkkDxzqe3+a7a15mxVVONBQNyRIAAGImKA8nSBSF70skHdJ6zQsYlrCVNVDNNKLl1hUiv1E9P7ne8ONqyOf4ouJi+HYQ2gzSj7oLvxz61vk174/K/Nxv1PUVTEFNRTMuMTAwVVVVVVVVLYdjEEkYAADRSgtdxguMBnerdS17VigyeiYvLUlpSnfraQigYGi4xK6hqj3/+0TE9QAJ0McprCUNyRySJHWCoajEvyhVzxOhKkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq1oS6AAAGVICRhoNZ97TRQmH2KYgZ/pcKAqNcdI//oipkBCrglUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+zTE84BHoG8XJ4UOgMYM4uTzjYBVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+yTE+YBFyG0ZJ7BlALuNoqTAjdBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE/ABFcE0dpIBuAH8EJDARpAVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE9ABELE0hooByKEgDouAkiExVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE7IFC0BUbIYxAYDiAYxgAAARVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE2gPAAAH+AAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE2gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE2gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE2gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE2gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE2gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE2gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE2gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE2gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE2gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE2gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE2gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE2gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE2gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE2gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE2gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE2gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE2gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xTE2gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU="
};

function showOnly(screen) {
  [landing, hostScreen, studentScreen].forEach(el => el.classList.toggle("hidden", el !== screen));
}

function showToast(message, ms = 2600) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), ms);
}

async function apiPost(payload) {
  const response = await fetch("/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({ error: "サーバー応答を読み取れませんでした。" }));
  if (!response.ok) throw new Error(data.error || "通信に失敗しました。");
  return data;
}

async function apiGet(params) {
  const query = new URLSearchParams(params);
  const response = await fetch(`/api?${query.toString()}`, { cache: "no-store" });
  const data = await response.json().catch(() => ({ error: "サーバー応答を読み取れませんでした。" }));
  if (!response.ok) throw new Error(data.error || "通信に失敗しました。");
  return data;
}

function normalizeRoomCode(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}

function canonicalJoinBaseUrl() {
  const url = new URL(window.location.href);
  // Cloudflareの個別デプロイURLから開いていても、学生用QRは常に本番URLへ向ける。
  if (/^[a-z0-9-]+\.public-health-bingo\.pages\.dev$/i.test(url.hostname)) {
    url.hostname = "public-health-bingo.pages.dev";
  }
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url;
}

function joinLink(code) {
  const room = normalizeRoomCode(code);
  const url = canonicalJoinBaseUrl();
  // QR読み取りアプリがqueryかhashの片方を落としても復元できるよう二重化する。
  url.searchParams.set("room", room);
  url.hash = `room=${room}`;
  return url.toString();
}

function roomCodeFromUrl() {
  const queryCode = new URLSearchParams(location.search).get("room");
  if (normalizeRoomCode(queryCode).length === 6) return normalizeRoomCode(queryCode);

  let rawHash = "";
  try {
    rawHash = decodeURIComponent(location.hash.replace(/^#/, "").trim());
  } catch {
    rawHash = location.hash.replace(/^#/, "").trim();
  }

  const hashParams = new URLSearchParams(rawHash.replace(/^\?/, ""));
  const hashParamCode = hashParams.get("room");
  if (normalizeRoomCode(hashParamCode).length === 6) return normalizeRoomCode(hashParamCode);

  // #ABC123、#/join/ABC123 のような形式にも対応。
  const hashMatch = rawHash.match(/(?:^|[\/=])([A-Z0-9]{6})(?:$|[&/?])/i);
  if (hashMatch) return normalizeRoomCode(hashMatch[1]);

  const pathMatch = location.pathname.match(/(?:room|join)\/([A-Z0-9]{6})(?:\/|$)/i);
  if (pathMatch) return normalizeRoomCode(pathMatch[1]);

  return "";
}

function makeQrUrl(text) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(text)}`;
}

function stopTimers() {
  clearInterval(hostPollTimer);
  clearInterval(studentPollTimer);
  clearInterval(countdownTimer);
  hostPollTimer = null;
  studentPollTimer = null;
  countdownTimer = null;
}

function beep(frequency = 660, duration = 0.08, volume = 0.035) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    osc.addEventListener("ended", () => ctx.close());
  } catch {}
}

function dataUrlToArrayBuffer(dataUrl) {
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function decodeAudioDataCompat(ctx, arrayBuffer) {
  return new Promise((resolve, reject) => {
    const copy = arrayBuffer.slice(0);
    const result = ctx.decodeAudioData(copy, resolve, reject);
    if (result?.then) result.then(resolve).catch(reject);
  });
}

function primeEventAudio() {
  if (eventAudioPreparePromise) return eventAudioPreparePromise;
  const ctx = ensureHostAudioContext();
  if (!ctx) return Promise.resolve(false);

  eventAudioPreparePromise = Promise.all(
    Object.entries(EVENT_AUDIO_DATA).map(async ([type, dataUrl]) => {
      const buffer = await decodeAudioDataCompat(ctx, dataUrlToArrayBuffer(dataUrl));
      eventAudioBuffers.set(type, buffer);
    })
  ).then(() => true).catch(error => {
    console.warn("イベント音声の準備に失敗しました", error);
    eventAudioPreparePromise = null;
    return false;
  });
  return eventAudioPreparePromise;
}

function fallbackEventSpeech(type) {
  const label = type === "bingo" ? "ビンゴ！" : "リーチ！";
  if (!supportsSpeech()) return false;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(label);
    utterance.lang = "ja-JP";
    utterance.rate = 0.86;
    utterance.volume = 1;
    activeUtterances.add(utterance);
    const cleanup = () => activeUtterances.delete(utterance);
    utterance.onend = cleanup;
    utterance.onerror = cleanup;
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

function playEventVoice(type, { volume = 1 } = {}) {
  const playBuffer = () => {
    const ctx = ensureHostAudioContext();
    const buffer = eventAudioBuffers.get(type);
    if (!ctx || !buffer) return false;
    try {
      window.speechSynthesis?.cancel?.();
      try { activeEventVoiceSource?.stop?.(); } catch {}
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      gain.gain.value = Math.max(0, Math.min(1.5, volume));
      source.connect(gain);
      gain.connect(ctx.destination);
      source.onended = () => {
        if (activeEventVoiceSource === source) activeEventVoiceSource = null;
      };
      activeEventVoiceSource = source;
      source.start(0);
      return true;
    } catch (error) {
      console.warn("イベント音声の再生に失敗しました", error);
      return false;
    }
  };

  const ctx = ensureHostAudioContext();
  if (!ctx) return fallbackEventSpeech(type);

  const afterResume = () => {
    if (eventAudioBuffers.has(type)) {
      if (!playBuffer()) fallbackEventSpeech(type);
      return;
    }
    primeEventAudio().then(ready => {
      if (!ready || !playBuffer()) fallbackEventSpeech(type);
    });
  };

  if (ctx.state === "suspended") {
    ctx.resume().then(afterResume).catch(() => fallbackEventSpeech(type));
  } else {
    afterResume();
  }
  return true;
}

function lineSetsForCard(card) {
  const lines = [];
  for (let r = 0; r < 5; r++) lines.push(card.slice(r * 5, r * 5 + 5));
  for (let c = 0; c < 5; c++) lines.push([0, 1, 2, 3, 4].map(r => card[r * 5 + c]));
  lines.push([0, 6, 12, 18, 24].map(i => card[i]));
  lines.push([4, 8, 12, 16, 20].map(i => card[i]));
  return lines;
}

function getNearLineKeys(card, marked) {
  const set = new Set(marked);
  return new Set(lineSetsForCard(card).map((line, index) => {
    const count = line.filter(qid => qid === -1 || set.has(qid)).length;
    return count === 4 ? index : null;
  }).filter(index => index !== null));
}

function supportsSpeech() {
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function refreshJapaneseVoice() {
  if (!supportsSpeech()) return;
  const voices = window.speechSynthesis.getVoices();
  japaneseVoice = voices.find(voice => voice.lang?.toLowerCase() === "ja-jp" && voice.localService)
    || voices.find(voice => voice.lang?.toLowerCase().startsWith("ja") && voice.localService)
    || voices.find(voice => voice.lang?.toLowerCase().startsWith("ja"))
    || null;
}

function ensureHostAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!hostAudioContext) hostAudioContext = new AudioContext();
  if (hostAudioContext.state === "suspended") hostAudioContext.resume().catch(() => {});
  return hostAudioContext;
}

function playHostNotes(notes) {
  if (!hostEffectsEnabled || !hostAudioUnlocked) return;
  const ctx = ensureHostAudioContext();
  if (!ctx) return;
  let at = ctx.currentTime + 0.02;
  notes.forEach(([frequency, duration = 0.09, gap = 0.03, volume = 0.055]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(at);
    osc.stop(at + duration + 0.02);
    at += duration + gap;
  });
}

function playHostEffect(type) {
  const effects = {
    enable: [[523, .08, .02], [659, .08, .02], [784, .13, .02]],
    start: [[523, .10, .02], [659, .10, .02], [784, .10, .02], [1047, .20, .02]],
    next: [[659, .07, .02], [784, .10, .02]],
    reveal: [[880, .08, .02], [1175, .16, .02]],
    tick: [[740, .055, .01, .045]],
    winner: [[784, .10, .02], [988, .10, .02], [1175, .10, .02], [1568, .28, .02]]
  };
  playHostNotes(effects[type] || effects.next);
}

function normalizeSpeechText(text) {
  return String(text ?? "")
    .replaceAll("WHO", "ダブリュー エイチ オー")
    .replaceAll("〜", "")
    .replaceAll("II", "ツー")
    .replace(/([0-9])\.([0-9])/g, "$1点$2")
    .replace(/\s+/g, " ")
    .trim();
}

function speakJapanese(text, { force = false, interrupt = true } = {}) {
  if (!supportsSpeech() || !hostAudioUnlocked || (!hostReadEnabled && !force)) return false;
  refreshJapaneseVoice();
  const synth = window.speechSynthesis;
  if (interrupt) synth.cancel();
  const utterance = new SpeechSynthesisUtterance(normalizeSpeechText(text));
  utterance.lang = "ja-JP";
  utterance.rate = Number.isFinite(hostSpeechRate) ? hostSpeechRate : 0.95;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  if (japaneseVoice) utterance.voice = japaneseVoice;
  activeUtterances.add(utterance);
  const cleanup = () => activeUtterances.delete(utterance);
  utterance.onend = cleanup;
  utterance.onerror = event => {
    cleanup();
    if (!["canceled", "interrupted"].includes(event.error)) {
      showToast("読み上げに失敗しました。リーチ・ビンゴ音声は固定音声で流れます。", 3600);
    }
  };
  setTimeout(() => {
    synth.resume();
    synth.speak(utterance);
  }, interrupt ? 80 : 0);
  return true;
}

function questionSpeech(question, position) {
  if (!question) return "";
  return `第${position + 1}問。${question.text}。1番、${question.options[0]}。2番、${question.options[1]}。`;
}

function answerSpeech(question) {
  if (!question?.answer) return "";
  return `正解は、${question.answer}番、${question.options[question.answer - 1]}です。`;
}

function updateAudioControls() {
  const enableButton = $("#audio-enable-btn");
  const readButton = $("#read-toggle-btn");
  const soundButton = $("#sound-toggle-btn");
  const readAgainButton = $("#read-again-btn");
  const rateSelect = $("#speech-rate");
  const note = $("#audio-note");
  if (!enableButton) return;

  enableButton.textContent = hostAudioUnlocked ? "✓ 音声は有効です" : "音声を有効にする";
  enableButton.classList.toggle("enabled", hostAudioUnlocked);
  readButton.textContent = `🎙 自動読み上げ ${hostReadEnabled ? "ON" : "OFF"}`;
  readButton.classList.toggle("on", hostReadEnabled);
  readButton.classList.toggle("off", !hostReadEnabled);
  readButton.setAttribute("aria-pressed", String(hostReadEnabled));
  soundButton.textContent = `♪ 効果音 ${hostEffectsEnabled ? "ON" : "OFF"}`;
  soundButton.classList.toggle("on", hostEffectsEnabled);
  soundButton.classList.toggle("off", !hostEffectsEnabled);
  soundButton.setAttribute("aria-pressed", String(hostEffectsEnabled));
  if (rateSelect) rateSelect.value = String(hostSpeechRate);
  if (readAgainButton) readAgainButton.disabled = !hostAudioUnlocked || !latestHostData?.question;

  if (!supportsSpeech()) {
    readButton.disabled = true;
    if (note) note.textContent = "このブラウザは自動読み上げに対応していません。効果音は利用できます。";
  } else if (note) {
    note.textContent = hostAudioUnlocked
      ? "有効です。誰かがリーチ／ビンゴになると、教員PCから固定音声が流れます。"
      : "最初に「音声を有効にする」を押してください。「リーチ」と聞こえれば準備完了です。";
  }
}

function unlockHostAudio({ announce = true } = {}) {
  const ctx = ensureHostAudioContext();
  hostAudioUnlocked = true;
  updateAudioControls();

  const prepare = ctx?.state === "suspended"
    ? ctx.resume().then(() => primeEventAudio())
    : primeEventAudio();

  prepare.then(ready => {
    if (!announce) return;
    if (ready) {
      playEventVoice("reach", { volume: 1.15 });
      showToast("音声テスト：リーチ！", 2200);
    } else {
      fallbackEventSpeech("reach");
      showToast("固定音声を準備できなかったため、端末音声でテストします。", 3000);
    }
  });
}

function readCurrentQuestion() {
  if (!latestHostData?.question) {
    showToast("まだ問題が表示されていません。");
    return;
  }
  if (!hostAudioUnlocked) unlockHostAudio({ announce: false });
  speakJapanese(questionSpeech(latestHostData.question, latestHostData.room.currentPos), { force: true });
}

function confetti(amount = 70) {
  const layer = $("#confetti-layer");
  const colors = ["#2563eb", "#f59e0b", "#16a34a", "#ef4444", "#8b5cf6", "#ec4899"];
  for (let i = 0; i < amount; i++) {
    const piece = document.createElement("i");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty("--drift", `${-120 + Math.random() * 240}px`);
    piece.style.animationDelay = `${Math.random() * 0.45}s`;
    piece.style.animationDuration = `${2.2 + Math.random() * 1.5}s`;
    layer.appendChild(piece);
    setTimeout(() => piece.remove(), 4300);
  }
}

async function createRoom() {
  const button = $("#create-btn");
  button.disabled = true;
  try {
    const data = await apiPost({ action: "create", winLines: Number($("#win-lines").value) });
    hostSession = { room: data.code, pin: data.pin };
    localStorage.setItem(`bingo-host-${data.code}`, JSON.stringify(hostSession));
    history.replaceState(null, "", `?host=${data.code}`);
    setupHostScreen();
    await pollHost();
    hostPollTimer = setInterval(pollHost, 1000);
  } catch (error) {
    showToast(error.message, 4200);
  } finally {
    button.disabled = false;
  }
}

function setupHostScreen() {
  stopTimers();
  showOnly(hostScreen);
  lastHostQuestionId = null;
  lastHostRevealedQuestionId = null;
  lastHostWinnerCount = 0;
  lastHostReachCount = 0;
  lastHostBingoCount = 0;
  latestHostData = null;
  updateAudioControls();
  $("#host-room-code").textContent = hostSession.room;
  $("#host-pin").textContent = hostSession.pin;
  const url = joinLink(hostSession.room);
  $("#join-url").textContent = url;
  $("#qr-image").src = makeQrUrl(url);
}

async function pollHost() {
  if (!hostSession) return;
  try {
    const data = await apiGet({ role: "host", room: hostSession.room, pin: hostSession.pin });
    renderHost(data);
  } catch (error) {
    showToast(error.message, 3800);
  }
}

function renderHost(data) {
  const { room, question, stats, players, winners } = data;
  latestHostData = data;
  updateAudioControls();
  $("#stat-players").textContent = stats.players;
  $("#stat-answered").textContent = stats.answered;
  $("#stat-reach").textContent = stats.reach;
  $("#stat-bingo").textContent = stats.bingo;

  const list = $("#player-list");
  if (!players.length) {
    list.textContent = "まだ参加者はいません";
  } else {
    list.innerHTML = players.map(p => {
      const winner = p.rank >= 1 && p.rank <= 3;
      return `<span class="player-chip ${winner ? "winner" : ""}">${winner ? `${p.rank}位 ` : ""}${escapeHtml(p.name)}</span>`;
    }).join("");
  }

  const waiting = room.status === "waiting";
  $("#host-waiting").classList.toggle("hidden", !waiting);
  $("#host-game").classList.toggle("hidden", waiting);
  $("#start-btn").disabled = stats.players < 1;

  if (!waiting) {
    $("#question-progress").textContent = room.currentPos >= 0
      ? `第${room.currentPos + 1}問 / ${room.totalQuestions}問`
      : "終了";
    $("#question-number").textContent = room.currentPos >= 0 ? `Q${room.currentPos + 1}` : "FINISH";

    if (question) {
      $("#host-question").textContent = question.text;
      $("#host-option-1 strong").textContent = question.options[0];
      $("#host-option-2 strong").textContent = question.options[1];
      $("#host-option-1").classList.toggle("correct", room.revealed && question.answer === 1);
      $("#host-option-2").classList.toggle("correct", room.revealed && question.answer === 2);
    }

    const answerBanner = $("#answer-banner");
    if (room.status === "ended") {
      answerBanner.textContent = winners.length >= 3 ? "上位3名が決定しました！表彰式へどうぞ 🎉" : "ゲームを終了しました";
      answerBanner.classList.remove("hidden");
    } else if (room.revealed && question) {
      answerBanner.textContent = `正解は ${question.answer}．${question.options[question.answer - 1]}`;
      answerBanner.classList.remove("hidden");
    } else {
      answerBanner.classList.add("hidden");
    }

    $("#timer-btn").disabled = room.revealed || room.status === "ended";
    $("#reveal-btn").disabled = room.revealed || room.status === "ended";
    $("#next-btn").disabled = !room.revealed || room.status === "ended";
    $("#next-btn").textContent = winners.length >= 3 ? "結果確定" : "次の問題";

    if (room.revealed) {
      $("#correct-rate").textContent = stats.answered > 0
        ? `${Math.round((stats.correct / stats.answered) * 100)}%`
        : "回答なし";
    } else {
      $("#correct-rate").textContent = "未発表";
    }
  }

  renderWinnerList($("#winner-list"), winners, "待機中");

  if (question && question.id !== lastHostQuestionId) {
    lastHostQuestionId = question.id;
    lastHostRevealedQuestionId = null;
    if (room.status === "live" && !room.revealed && hostAudioUnlocked) {
      setTimeout(() => speakJapanese(questionSpeech(question, room.currentPos)), 180);
    }
  }

  if (question && room.revealed && lastHostRevealedQuestionId !== question.id) {
    lastHostRevealedQuestionId = question.id;
    if (hostAudioUnlocked) {
      playHostEffect("reveal");
      setTimeout(() => speakJapanese(answerSpeech(question)), 220);
    }
  }

  // 人数の増減だけでなく、各学生の状態変化を追跡します。
  // これにより「別の学生がビンゴになり、同時に誰かがリーチ」のような場面も検出できます。
  const currentPlayerStates = new Map(players.map((player, index) => [
    `${index}:${player.name}`,
    { near: Number(player.near || 0), lines: Number(player.lines || 0) }
  ]));

  let newReachDetected = false;
  let newBingoDetected = false;
  if (hostPlayerStatesInitialized) {
    for (const [key, current] of currentPlayerStates) {
      const previous = lastHostPlayerStates.get(key) || { near: 0, lines: 0 };
      if (current.lines >= Number(room.winLines) && previous.lines < Number(room.winLines)) {
        newBingoDetected = true;
      } else if (current.near > 0 && previous.near === 0 && current.lines < Number(room.winLines)) {
        newReachDetected = true;
      }
    }
  }
  lastHostPlayerStates = currentPlayerStates;
  hostPlayerStatesInitialized = true;

  if (hostAudioUnlocked && newBingoDetected) {
    playEventVoice("bingo", { volume: 1.2 });
    showToast("ビンゴ！", 2400);
  } else if (hostAudioUnlocked && newReachDetected) {
    playEventVoice("reach", { volume: 1.15 });
    showToast("リーチ！", 1800);
  }

  lastHostReachCount = stats.reach;
  lastHostBingoCount = stats.bingo;

  if (winners.length > lastHostWinnerCount && hostAudioUnlocked) {
    playHostEffect("winner");
    const newest = winners.slice(lastHostWinnerCount);
    const announcement = newest.map(w => `第${w.rank}位、${w.name}さん。おめでとうございます。`).join(" ");
    setTimeout(() => speakJapanese(announcement, { interrupt: false }), 1550);
  }
  lastHostWinnerCount = winners.length;
}

async function hostAction(action) {
  if (!hostSession) return;
  if (["start", "reveal", "next"].includes(action) && !hostAudioUnlocked) {
    unlockHostAudio({ announce: false });
  }
  try {
    await apiPost({ action, room: hostSession.room, pin: hostSession.pin });
    if (action === "start") playHostEffect("start");
    if (action === "next") playHostEffect("next");
    if (action === "reveal") {
      clearInterval(countdownTimer);
      countdownTimer = null;
      $("#countdown").textContent = "✓";
    }
    await pollHost();
  } catch (error) {
    showToast(error.message, 3500);
  }
}

function startCountdown() {
  if (!hostAudioUnlocked) unlockHostAudio({ announce: false });
  clearInterval(countdownTimer);
  countdownValue = 10;
  $("#countdown").textContent = countdownValue;
  playHostEffect("next");
  countdownTimer = setInterval(async () => {
    countdownValue -= 1;
    $("#countdown").textContent = countdownValue;
    if (countdownValue <= 3 && countdownValue > 0) playHostEffect("tick");
    if (countdownValue <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      $("#countdown").textContent = "0";
      await hostAction("reveal");
    }
  }, 1000);
}

async function joinRoom() {
  const room = normalizeRoomCode($("#join-room").value);
  const name = $("#join-name").value.trim();
  if (!room || !name) {
    showToast("ルームコードとニックネームを入力してください。");
    return;
  }
  const button = $("#join-btn");
  button.disabled = true;
  try {
    const data = await apiPost({ action: "join", room, name });
    playerSession = { room: data.room, playerId: data.playerId, name };
    localStorage.setItem(`bingo-player-${data.room}`, JSON.stringify(playerSession));
    history.replaceState(null, "", `/?room=${data.room}#room=${data.room}`);
    setupStudentScreen();
    await pollStudent();
    studentPollTimer = setInterval(pollStudent, 1200);
  } catch (error) {
    showToast(error.message, 4200);
  } finally {
    button.disabled = false;
  }
}

function setupStudentScreen() {
  stopTimers();
  showOnly(studentScreen);
  $("#student-name").textContent = playerSession.name;
  $("#student-room-code").textContent = playerSession.room;
  lastStudentQuestionId = null;
  lastStudentLines = 0;
  celebratedRank = null;
}

async function pollStudent() {
  if (!playerSession) return;
  try {
    const data = await apiGet({ role: "student", room: playerSession.room, player: playerSession.playerId });
    renderStudent(data);
  } catch (error) {
    clearInterval(studentPollTimer);
    studentPollTimer = null;
    showToast(error.message, 4300);
  }
}

function renderStudent(data) {
  const { room, question, player, winners } = data;
  $("#line-count").textContent = `${player.lines}列`;
  renderBoard(player.card, player.marked);
  renderWinnerList($("#student-winner-list"), winners, "まだビンゴはいません");

  const status = $("#student-status");
  status.className = "status-pill";
  const buttons = [$("#answer-1"), $("#answer-2")];
  buttons.forEach(btn => {
    btn.classList.remove("selected", "correct", "wrong");
    btn.disabled = true;
  });

  const result = $("#student-result");
  result.className = "student-result hidden";

  if (room.status === "waiting") {
    $("#student-progress").textContent = `勝利条件：${room.winLines}列`;
    status.textContent = "待機中";
    $("#student-question").textContent = "先生がゲームを開始するまでお待ちください";
    buttons[0].querySelector("strong").textContent = "選択肢1";
    buttons[1].querySelector("strong").textContent = "選択肢2";
  } else if (room.status === "ended") {
    $("#student-progress").textContent = "ゲーム終了";
    status.textContent = "終了";
    $("#student-question").textContent = "お疲れさまでした！上位3名は前へどうぞ";
    showPlayerOutcome(player, result, room.winLines);
  } else if (question) {
    $("#student-progress").textContent = `第${room.currentPos + 1}問 / ${room.totalQuestions}問`;
    status.textContent = room.revealed ? "正解発表" : (data.answered ? "回答済み" : "回答受付中");
    status.classList.add(room.revealed ? "revealed" : "live");
    $("#student-question").textContent = question.text;
    buttons[0].querySelector("strong").textContent = question.options[0];
    buttons[1].querySelector("strong").textContent = question.options[1];

    if (lastStudentQuestionId !== question.id) {
      lastStudentQuestionId = question.id;
      answerBusy = false;
      if (navigator.vibrate) navigator.vibrate(30);
    }

    if (!room.revealed) {
      buttons.forEach(btn => btn.disabled = data.answered || answerBusy);
      if (data.selected) buttons[data.selected - 1].classList.add("selected");
      if (data.answered) {
        result.textContent = "回答を受け付けました。正解発表を待ってください。";
        result.className = "student-result";
      }
    } else {
      if (data.selected) buttons[data.selected - 1].classList.add("selected");
      if (question.answer) buttons[question.answer - 1].classList.add("correct");
      if (data.selected && data.selected !== question.answer) buttons[data.selected - 1].classList.add("wrong");

      const correct = data.selected === question.answer;
      result.textContent = data.selected
        ? (correct ? "正解！ マスが1つ開きました" : `残念。正解は「${question.options[question.answer - 1]}」`)
        : `未回答でした。正解は「${question.options[question.answer - 1]}」`;
      result.className = `student-result ${correct ? "good" : "bad"}`;
    }
  }

  const nearLineKeys = getNearLineKeys(player.card, player.marked);
  const hasNewReach = [...nearLineKeys].some(key => !lastStudentNearKeys.has(key));
  if (hasNewReach && player.rank === null && player.lines < room.winLines) {
    confetti(24);
    playEventVoice("reach", { volume: 0.95 });
    beep(920, .12, .05);
    showToast("リーチ！ あと1マス！", 3000);
  }
  lastStudentNearKeys = nearLineKeys;

  if (player.lines > lastStudentLines) {
    if (player.rank === null && player.lines < room.winLines) {
      confetti(35);
      beep(920, .12, .05);
      showToast(`${player.lines}列完成！あと${room.winLines - player.lines}列！`, 3200);
    }
    lastStudentLines = player.lines;
  }

  if (player.rank !== null && celebratedRank !== player.rank) {
    celebratedRank = player.rank;
    showPlayerOutcome(player, result, room.winLines);
    confetti(player.rank >= 1 && player.rank <= 3 ? 130 : 65);
    playEventVoice("bingo", { volume: 1 });
    beep(1040, .22, .06);
    setTimeout(() => beep(1320, .25, .055), 180);
    if (navigator.vibrate) navigator.vibrate([80, 50, 160]);
  }
}

function showPlayerOutcome(player, result, winLines) {
  if (player.rank >= 1 && player.rank <= 3) {
    result.textContent = `🎉 第${player.rank}位！ この画面を先生に見せてください`;
    result.className = "student-result win";
  } else if (player.rank === 0 || player.lines >= winLines) {
    result.textContent = "ビンゴ完成！惜しくも上位3名には届きませんでした";
    result.className = "student-result good";
  }
}

async function submitAnswer(choice) {
  if (!playerSession || answerBusy) return;
  primeEventAudio();
  if (supportsSpeech()) window.speechSynthesis.resume();
  answerBusy = true;
  const buttons = [$("#answer-1"), $("#answer-2")];
  buttons.forEach(btn => btn.disabled = true);
  buttons[choice - 1].classList.add("selected");
  try {
    await apiPost({ action: "answer", room: playerSession.room, playerId: playerSession.playerId, choice });
    beep(choice === 1 ? 620 : 720, .06, .025);
    await pollStudent();
  } catch (error) {
    answerBusy = false;
    showToast(error.message, 3300);
    await pollStudent();
  }
}

function renderBoard(card, marked) {
  const board = $("#bingo-board");
  const markedSet = new Set(marked);
  board.innerHTML = card.map((qid, index) => {
    if (qid === -1) return `<div class="bingo-cell free marked"><span>FREE</span></div>`;
    const q = QUESTIONS[qid];
    return `<div class="bingo-cell ${markedSet.has(qid) ? "marked" : ""}" title="${escapeHtml(q.text)}"><small>${index + 1}</small><span>${escapeHtml(q.short)}</span></div>`;
  }).join("");
}

function renderWinnerList(element, winners, emptyText) {
  if (!winners || winners.length === 0) {
    element.innerHTML = `<li>${escapeHtml(emptyText)}</li>`;
    return;
  }
  const medals = ["🥇", "🥈", "🥉"];
  element.innerHTML = winners.map(w => `<li>${medals[(Number(w.rank) || 1) - 1] || "🏅"} ${escapeHtml(w.name)}</li>`).join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function bindEvents() {
  $("#create-btn").addEventListener("click", createRoom);
  $("#join-btn").addEventListener("click", () => {
    primeEventAudio();
    joinRoom();
  });
  $("#join-room").addEventListener("input", event => { event.target.value = normalizeRoomCode(event.target.value); });
  $("#join-name").addEventListener("keydown", event => { if (event.key === "Enter") joinRoom(); });
  $("#start-btn").addEventListener("click", () => hostAction("start"));
  $("#reveal-btn").addEventListener("click", () => hostAction("reveal"));
  $("#next-btn").addEventListener("click", () => hostAction("next"));
  $("#end-btn").addEventListener("click", () => {
    if (window.confirm("ゲームを終了しますか？")) hostAction("end");
  });
  $("#timer-btn").addEventListener("click", startCountdown);
  $("#audio-enable-btn").addEventListener("click", () => unlockHostAudio());
  $("#read-toggle-btn").addEventListener("click", () => {
    hostReadEnabled = !hostReadEnabled;
    localStorage.setItem("bingo-host-read", hostReadEnabled ? "on" : "off");
    if (hostReadEnabled && !hostAudioUnlocked) unlockHostAudio({ announce: false });
    updateAudioControls();
    if (hostReadEnabled && latestHostData?.question) readCurrentQuestion();
  });
  $("#sound-toggle-btn").addEventListener("click", () => {
    hostEffectsEnabled = !hostEffectsEnabled;
    localStorage.setItem("bingo-host-effects", hostEffectsEnabled ? "on" : "off");
    if (hostEffectsEnabled && !hostAudioUnlocked) unlockHostAudio({ announce: false });
    updateAudioControls();
    if (hostEffectsEnabled) playHostEffect("enable");
  });
  $("#speech-rate").addEventListener("change", event => {
    hostSpeechRate = Number(event.target.value) || 0.95;
    localStorage.setItem("bingo-host-rate", String(hostSpeechRate));
    if (latestHostData?.question && hostAudioUnlocked) readCurrentQuestion();
  });
  $("#read-again-btn").addEventListener("click", readCurrentQuestion);
  $("#answer-1").addEventListener("click", () => submitAnswer(1));
  $("#answer-2").addEventListener("click", () => submitAnswer(2));
}

window.addEventListener("hashchange", () => {
  if (playerSession || !landing || landing.classList.contains("hidden")) return;
  const roomCode = roomCodeFromUrl();
  if (!roomCode) return;
  $("#join-room").value = roomCode;
  $("#join-name").focus();
});

async function restoreFromUrl() {
  const params = new URLSearchParams(location.search);
  const hostCode = normalizeRoomCode(params.get("host"));
  const roomCode = roomCodeFromUrl();

  if (hostCode) {
    const saved = safeJson(localStorage.getItem(`bingo-host-${hostCode}`));
    if (saved?.pin) {
      hostSession = saved;
      setupHostScreen();
      await pollHost();
      hostPollTimer = setInterval(pollHost, 1000);
      return;
    }
    history.replaceState(null, "", location.pathname);
    showToast("教員PINを復元できません。新しいルームを作成してください。", 4200);
  }

  if (roomCode) {
    $("#join-room").value = roomCode;
    const saved = safeJson(localStorage.getItem(`bingo-player-${roomCode}`));
    if (saved?.playerId) {
      playerSession = saved;
      setupStudentScreen();
      try {
        await pollStudent();
        studentPollTimer = setInterval(pollStudent, 1200);
        return;
      } catch {}
    }
    $("#join-name").focus();
  }
}

function safeJson(value) {
  try { return JSON.parse(value); } catch { return null; }
}

document.addEventListener("DOMContentLoaded", async () => {
  if (supportsSpeech()) {
    refreshJapaneseVoice();
    window.speechSynthesis.addEventListener?.("voiceschanged", refreshJapaneseVoice);
  }
  bindEvents();
  updateAudioControls();
  await restoreFromUrl();
});
