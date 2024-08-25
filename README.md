# relitySecondBot-ts

### Scraper & Telegram Bot

This project scrapes real estate listings from SReality and IDnes and sends updates via a Telegram bot.

It uses GitHub Actions to automate the process, which runs multiple times an hour to keep the data up-to-date.

```
+---------------+
|  Start Script |
+---------------+
        |
        v
+---------------+
| Launch        |
| Puppeteer     |
+---------------+
        |
        v
+---------------+        +----------------+
| Scrape        |        | Combine &      |
| SReality &    |        | Compare with   |
| IDnes         | ------>| `data.json`    |
+---------------+        +----------------+
        |                        |
        v                        v
+---------------+        +--------------------+
| Send New      |        | Update `data.json` |
| Offers via    |        +--------------------+
| Telegram Bot  |
+---------------+
        |
        v
+---------------+
|  Exit Script  |
+---------------+
```
