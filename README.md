# 希望之路 · 互動衛教手冊

癌症希望基金會《希望之路》系列手冊的互動網頁版。

## 資料夾結構

```
index.html              書架首頁
assets/hope.css         全站共用樣式（新手冊共用）
assets/hope.js          全站共用互動（目錄、手風琴、分段切換、大字模式…）
chemo/index.html        面對化學治療（原檔，只在頂列加了「← 書架」）
radiation/index.html    面對放射線治療
targeted/index.html     面對標靶治療
immuno/index.html       面對癌症免疫藥物治療
cervical/index.html     面對子宮頸癌
endometrial/index.html  面對子宮內膜癌
ovarian/index.html      面對卵巢癌
nutrition/index.html    飲食滿分・抗癌加分
intimacy/index.html     女人的癌後性福
```

## 上傳到 GitHub Pages

1. 建一個新的 repository，把這個資料夾裡**所有檔案和子資料夾**原樣上傳（要保留資料夾結構）。
2. Settings → Pages → Source 選 `Deploy from a branch`，Branch 選 `main` / `(root)`，按 Save。
3. 一兩分鐘後網址會是 `https://<帳號>.github.io/<repo 名稱>/`。

所有連結都用相對路徑，repo 取什麼名字都可以。

> 在電腦上直接雙擊打開 index.html 時，點書架上的手冊會開到資料夾而不是頁面，這是本機預覽的限制，上傳到 GitHub Pages 後就正常。
