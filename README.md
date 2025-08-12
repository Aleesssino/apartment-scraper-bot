# Apartment Scraper Bot

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
| SReality &    | -----> | Compare with   |
| IDnes         |        | `data.json`    |
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

## License

<details><summary>WTFPL</summary>

```

                        DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                                 Version 2, December 2004

                      Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>

            Everyone is permitted to copy and distribute verbatim or modified
           copies of this license document, and changing it is allowed as long
                                  as the name is changed.

                       DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE

             TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

                       0. You just DO WHAT THE FUCK YOU WANT TO.

```

</details>
