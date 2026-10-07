// ==UserScript==
// @name         Dork it B8
// @namespace    https://github.com/Bil8l/dork-it-b8
// @version      10.1
// @description  Google Dorking assistant. Categories, favorites, recents, custom dorks, keyboard nav, sweep mode.
// @author       Bil8l
// @match        https://www.google.com/*
// @match        https://google.com/*
// @match        https://www.google.tld/*
// @grant        none
// @license      MIT
// @noframes
// @updateURL    https://raw.githubusercontent.com/Bil8l/dork-it-b8/main/dork-it-b8.user.js
// @downloadURL  https://raw.githubusercontent.com/Bil8l/dork-it-b8/main/dork-it-b8.user.js
// ==/UserScript==

(function () {
    'use strict';

    // =========================================================================
    // 1. DATA
    // =========================================================================
    const DORK_DB = [
        {
            id: 'op', label: 'Operators', cat: 'Op',
            items: [
                { key: 'site:',       desc: 'Search within a specific domain' },
                { key: 'inurl:',      desc: 'URL contains keyword' },
                { key: 'intitle:',    desc: 'Page title contains keyword' },
                { key: 'filetype:',   desc: 'Specific file extension' },
                { key: 'ext:',        desc: 'File extension (alt syntax)' },
                { key: 'cache:',      desc: 'Google cached version of page' },
                { key: 'intext:',     desc: 'Body text contains keyword' },
                { key: 'allinurl:',   desc: 'All terms appear in URL' },
                { key: 'allintitle:', desc: 'All terms appear in title' },
                { key: 'allintext:',  desc: 'All terms appear in body' },
                { key: 'related:',    desc: 'Sites related to given URL' },
                { key: 'info:',       desc: 'Info about a URL' },
            ]
        },
        {
            id: 'recon', label: 'Recon', cat: 'Recon',
            items: [
                { key: 'site:*.[domain] -www',                          desc: 'All subdomains, exclude www' },
                { key: 'site:*.[domain] inurl:signup | inurl:register', desc: 'Signup / register pages' },
                { key: 'site:*.[domain] inurl:api',                     desc: 'API endpoints' },
                { key: 'site:*.[domain] inurl:dev | inurl:staging',     desc: 'Dev / staging environments' },
                { key: 'site:*.[domain] inurl:test | inurl:demo',       desc: 'Test / demo environments' },
                { key: 'site:*.[domain] ext:pdf | ext:doc | ext:docx',  desc: 'Public documents' },
            ]
        },
        {
            id: 'foot', label: 'Footholds', cat: 'Foot',
            items: [
                { key: 'inurl:wp-admin',                  desc: 'WordPress admin panel' },
                { key: 'inurl:phpmyadmin',                desc: 'phpMyAdmin panel' },
                { key: 'inurl:admin intitle:"login"',     desc: 'Generic admin login' },
                { key: 'inurl:"/admin/login.php"',        desc: 'PHP admin login' },
                { key: 'inurl:shell intitle:"php shell"', desc: 'PHP shell access' },
                { key: 'inurl:"/wp-login.php"',           desc: 'WordPress login page' },
                { key: 'inurl:joomla intitle:"admin"',    desc: 'Joomla admin panel' },
                { key: 'inurl:drupal intitle:"admin"',    desc: 'Drupal admin panel' },
            ]
        },
        {
            id: 'dirs', label: 'Sensitive Dirs', cat: 'Dirs',
            items: [
                { key: 'intitle:"index of" ".git"',     desc: 'Exposed git repos' },
                { key: 'intitle:"index of" ".env"',     desc: 'Exposed .env files' },
                { key: 'intitle:"index of" ".ssh"',     desc: 'SSH key directories' },
                { key: 'intitle:"index of" "backup"',   desc: 'Backup directories' },
                { key: 'intitle:"index of" "database"', desc: 'Exposed database dirs' },
                { key: 'intitle:"index of" "uploads"',  desc: 'Upload directories' },
                { key: 'intitle:"index of" "config"',   desc: 'Config directories' },
                { key: 'intitle:"index of" "logs"',     desc: 'Log directories' },
            ]
        },
        {
            id: 'vfile', label: 'Vulnerable Files', cat: 'VFile',
            items: [
                { key: 'filetype:env "DB_PASSWORD"',                    desc: 'Laravel/Django .env files' },
                { key: 'filetype:sql intext:"INSERT INTO"',             desc: 'SQL dump files' },
                { key: 'ext:bak inurl:"wp-config"',                     desc: 'WordPress config backups' },
                { key: 'inurl:"/.git/config"',                          desc: 'Exposed git config' },
                { key: 'filetype:log intext:"error" intext:"password"', desc: 'Logs with passwords' },
                { key: 'ext:xml | ext:conf intext:"password"',          desc: 'Config files with passwords' },
                { key: 'filetype:ini intext:"password"',                desc: '.ini files with passwords' },
                { key: 'filetype:yaml intext:"password"',               desc: 'YAML files with passwords' },
                { key: 'filetype:json intext:"api_key"',                desc: 'JSON files with API keys' },
            ]
        },
        {
            id: 'vserv', label: 'Vulnerable Servers', cat: 'VServ',
            items: [
                { key: 'intitle:"phpinfo()"',                             desc: 'PHP info disclosure' },
                { key: 'inurl:"/phpinfo.php"',                            desc: 'PHP info file' },
                { key: 'inurl:"/server-status" intitle:"Apache Status"',  desc: 'Apache server status' },
                { key: 'inurl:"/elmah.axd"',                             desc: 'ASP.NET error log viewer' },
                { key: 'inurl:":8080/manager/html"',                     desc: 'Tomcat manager' },
                { key: 'intitle:"Grafana" inurl:"/login"',               desc: 'Exposed Grafana' },
                { key: 'intitle:"Jenkins" inurl:"/login"',               desc: 'Exposed Jenkins' },
                { key: 'intitle:"Kibana" inurl:":5601"',                 desc: 'Exposed Kibana' },
            ]
        },
        {
            id: 'errors', label: 'Error Messages', cat: 'Errors',
            items: [
                { key: 'intext:"SQL syntax" intext:"mysql_fetch"',  desc: 'MySQL error leaks' },
                { key: 'intext:"Warning: mysql_connect()"',         desc: 'MySQL connection errors' },
                { key: 'intitle:"500 Internal Server Error"',       desc: 'Generic server errors' },
                { key: 'intext:"ORA-" intext:"Oracle"',             desc: 'Oracle DB errors' },
                { key: 'intext:"pg_query()" intext:"PostgreSQL"',   desc: 'PostgreSQL errors' },
                { key: 'intext:"Microsoft OLE DB" intext:"error"',  desc: 'MSSQL OLE DB errors' },
            ]
        },
        {
            id: 'juicy', label: 'Juicy Info', cat: 'Juicy',
            items: [
                { key: 'filetype:xls intext:"username" intext:"password"', desc: 'Excel credential files' },
                { key: 'intitle:"index of" "config.php"',                  desc: 'Exposed PHP config files' },
                { key: 'intext:"phpMyAdmin SQL Dump" filetype:sql',        desc: 'phpMyAdmin dumps' },
                { key: 'filetype:pdf intext:"confidential"',               desc: 'Confidential PDFs' },
                { key: 'filetype:xls intext:"salary"',                     desc: 'Salary spreadsheets' },
                { key: 'intext:"JDBC" intext:"password" filetype:xml',     desc: 'JDBC config with passwords' },
                { key: 'inurl:"/wp-json/wp/v2/users"',                     desc: 'WordPress user enumeration' },
            ]
        },
        {
            id: 'passwd', label: 'Passwords', cat: 'Passwd',
            items: [
                { key: 'filetype:log intext:"password"',                   desc: 'Password in log files' },
                { key: '"Password=" filetype:config',                      desc: 'Password in config files' },
                { key: 'inurl:"/wp-config.php.bak"',                       desc: 'WordPress config backup' },
                { key: 'inurl:wp-content/uploads filetype:txt "password"', desc: 'WP password uploads' },
                { key: 'filetype:csv intext:"password"',                   desc: 'CSV files with passwords' },
                { key: 'intext:"LDAP" intext:"password" filetype:properties', desc: 'LDAP config with passwords' },
            ]
        },
        {
            id: 'users', label: 'Usernames', cat: 'Users',
            items: [
                { key: 'filetype:txt intext:"username" intext:"password"',    desc: 'TXT files with credentials' },
                { key: 'intext:"mail" intext:"samAccountName" filetype:xlsx', desc: 'Active Directory exports' },
                { key: 'inurl:wp-content/uploads filetype:xls',              desc: 'Excel uploads with user data' },
                { key: 'filetype:csv intext:"email" intext:"username"',       desc: 'CSV user lists' },
            ]
        },
        {
            id: 'login', label: 'Login Portals', cat: 'Login',
            items: [
                { key: 'intitle:"Login" inurl:admin',      desc: 'Admin login portals' },
                { key: 'intitle:"Member Login"',            desc: 'Member login pages' },
                { key: 'inurl:signin intitle:"login"',     desc: 'Sign-in pages' },
                { key: 'inurl:"/cpanel"',                  desc: 'cPanel login' },
                { key: 'inurl:"/remote/login"',            desc: 'Fortinet / VPN login' },
                { key: 'inurl:"/owa/" intitle:"Outlook"',  desc: 'Outlook Web Access' },
                { key: 'inurl:"/citrix/xenapp"',           desc: 'Citrix login' },
                { key: 'intitle:"GlobalProtect Portal"',   desc: 'Palo Alto VPN portal' },
            ]
        },
        {
            id: 'server', label: 'Server Detection', cat: 'Server',
            items: [
                { key: 'intitle:"Welcome to nginx"',   desc: 'Nginx default page' },
                { key: 'intitle:"Apache HTTP Server"', desc: 'Apache default page' },
                { key: 'intitle:"IIS Windows Server"', desc: 'IIS default page' },
                { key: 'intitle:"test page" "apache"', desc: 'Apache test pages' },
                { key: 'intitle:"Tomcat" inurl:8080',  desc: 'Apache Tomcat' },
            ]
        },
        {
            id: 'net', label: 'Network / Vuln', cat: 'Net',
            items: [
                { key: 'intitle:"RouterOS" inurl:"/winbox/"',     desc: 'MikroTik routers' },
                { key: 'intitle:"Cisco Systems" "CISCO SYSTEMS"', desc: 'Cisco devices' },
                { key: 'inurl:":8080" intitle:"Dashboard"',       desc: 'Port 8080 dashboards' },
                { key: 'inurl:":9200" intitle:"Elasticsearch"',   desc: 'Exposed Elasticsearch' },
                { key: 'intitle:"pfSense" inurl:"/index.php"',    desc: 'pfSense firewall' },
                { key: 'intitle:"Netgear" inurl:"/index.htm"',    desc: 'Netgear router panel' },
                { key: 'inurl:":3000" intitle:"Grafana"',         desc: 'Grafana on port 3000' },
            ]
        },
        {
            id: 'devices', label: 'Online Devices', cat: 'Devices',
            items: [
                { key: 'intitle:"webcamXP 5"',                            desc: 'webcamXP streams' },
                { key: 'inurl:"/view/index.shtml"',                       desc: 'IP camera feeds' },
                { key: 'intitle:"Network Camera" inurl:8080',             desc: 'Network cameras on 8080' },
                { key: 'intitle:"Hikvision" inurl:"/doc/page/login.asp"', desc: 'Hikvision cameras' },
                { key: 'intitle:"Axis" inurl:"/jpg/image.jpg"',           desc: 'Axis IP cameras' },
                { key: 'inurl:"/mjpg/video.mjpg"',                        desc: 'MJPEG video streams' },
            ]
        },
    ];

    // Flat list, used only for cross-category search.
    // Custom dorks are injected at search time so they stay current.
    const DORK_FLAT = DORK_DB.flatMap(c =>
        c.items.map(i => ({ ...i, cat: c.cat, catLabel: c.label }))
    );

    // =========================================================================
    // 2. STORAGE  helpers
    //    ls  = localStorage   (persists across sessions)
    //    ss  = sessionStorage (survives Google page navigations in same tab)
    // =========================================================================
    const ls = {
        get(k)    { try { return JSON.parse(localStorage.getItem('db8.' + k)); }   catch { return null; } },
        set(k, v) { try { localStorage.setItem('db8.' + k, JSON.stringify(v)); }   catch {} },
    };
    const ss = {
        get(k)    { try { return JSON.parse(sessionStorage.getItem('db8.' + k)); } catch { return null; } },
        set(k, v) { try { sessionStorage.setItem('db8.' + k, JSON.stringify(v)); } catch {} },
    };

    // HTML-escape for anything interpolated into innerHTML (custom dorks are user input)
    const esc = s => String(s).replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

    // =========================================================================
    // 3. CSS
    // =========================================================================
    const CSS = `
        /* ---- Design tokens (shared by all UI roots) ---- */
        .db8-icon, .db8-menu, .db8-sweep {
            --acc:    #bb86fc;   /* accent */
            --acc-hi: #cdaaff;   /* accent hover (lighter) */
            --acc-lo: #9a5fd6;   /* accent pressed (darker) */
            --bg:     #111111;   /* menu surface */
            --bg-2:   #1a1a1a;   /* raised: header, inputs, chips */
            --hover:  #1e1e1e;   /* row hover / focus */
            --line:   #1d1d1d;   /* hairline dividers */
            --t1:     #cccccc;   /* primary text */
            --t2:     #999999;   /* secondary text */
            --t3:     #666666;   /* faint: idle icons, meta */
            --gold:   #e6b800;
            --red:    #cf6679;
            --mono:   ui-monospace, "Cascadia Mono", Consolas, monospace;
        }

        /* ---- Icon ---- */
        .db8-icon {
            position: fixed; width: 24px; height: 24px;
            background: var(--bg-2); border: 1px solid #3a3a3a; border-radius: 4px;
            cursor: pointer; z-index: 99999;
            display: flex; align-items: center; justify-content: center;
            color: var(--t2); font-size: 13px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            box-shadow: 0 2px 4px rgba(0,0,0,.4);
            transition: background .15s ease-out, border-color .15s ease-out,
                        color .15s ease-out, transform .15s ease-out;
            user-select: none;
        }
        .db8-icon:hover  { background: var(--acc); color: #000; border-color: var(--acc); transform: scale(1.08); }
        .db8-icon:active { transform: scale(.96); }
        .db8-icon.sweep-on { background: #1e1230; border-color: var(--acc); color: var(--acc); }

        /* ---- Menu shell ---- */
        .db8-menu {
            position: fixed; width: 300px;
            background: var(--bg); border: 1px solid #2a2a2a; border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,.6);
            z-index: 100000; display: none; flex-direction: column;
            max-height: 480px; overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        /* ---- Header ---- */
        .db8-hdr {
            padding: 8px 12px; background: var(--bg-2); border-bottom: 1px solid var(--line);
            cursor: move; user-select: none;
            display: flex; justify-content: space-between; align-items: center; gap: 8px;
            border-radius: 8px 8px 0 0; flex-shrink: 0;
        }
        .db8-hdr-l { display: flex; align-items: center; gap: 4px; min-width: 0; }
        .db8-back {
            color: var(--acc); cursor: pointer; font-size: 15px;
            padding: 2px 6px; border-radius: 4px; flex-shrink: 0; line-height: 1;
            transition: background .15s ease-out, color .15s ease-out;
        }
        .db8-back:hover { background: #2a2a2a; color: #fff; }
        .db8-title { color: var(--t2); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .db8-close {
            cursor: pointer; color: var(--t3); font-size: 13px; flex-shrink: 0; line-height: 1;
            transition: color .15s ease-out;
        }
        .db8-close:hover { color: var(--red); }

        /* ---- Scrollable list ---- */
        .db8-list { overflow-y: auto; flex: 1; }
        .db8-list::-webkit-scrollbar { width: 4px; }
        .db8-list::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

        /* ---- Category rows ---- */
        .db8-cat {
            padding: 8px 12px; cursor: pointer; border-bottom: 1px solid var(--line);
            display: flex; justify-content: space-between; align-items: center; outline: none;
            transition: background .12s ease-out;
        }
        .db8-cat:hover, .db8-cat:focus { background: var(--hover); }
        .db8-cat.virt .db8-cat-name { color: var(--acc); }
        .db8-cat-l { display: flex; align-items: center; gap: 8px; }
        .db8-cat-name { color: var(--t1); font-size: 13px; }
        .db8-cat-cnt { background: var(--bg-2); color: var(--t2); font-size: 9px; padding: 1px 6px; border-radius: 8px; }
        .db8-cat-arr { color: var(--t3); font-size: 14px; transition: color .12s ease-out; }
        .db8-cat:hover .db8-cat-arr, .db8-cat:focus .db8-cat-arr { color: var(--t2); }

        /* ---- Dork rows ---- */
        .db8-item {
            display: flex; align-items: flex-start; gap: 8px;
            padding: 8px 12px; border-bottom: 1px solid var(--line); outline: none;
            transition: background .12s ease-out;
        }
        .db8-item:hover, .db8-item:focus { background: var(--hover); }
        .db8-item-body { flex: 1; min-width: 0; cursor: pointer; }
        .db8-item-acts {
            display: flex; gap: 4px; flex-shrink: 0;
            opacity: 0; transition: opacity .15s ease-out; padding-top: 2px;
        }
        .db8-item:hover .db8-item-acts,
        .db8-item:focus-within .db8-item-acts { opacity: 1; }
        .db8-key { color: var(--acc); font-family: var(--mono); font-size: 12px; word-break: break-all; line-height: 1.4; }
        .db8-tag { background: var(--bg-2); color: var(--t2); font-size: 9px; padding: 1px 4px; border-radius: 4px; margin-left: 4px; vertical-align: middle; }
        .db8-desc { display: block; color: var(--t2); font-size: 11px; margin-top: 4px; }
        .db8-btn {
            background: none; border: none; cursor: pointer; font-size: 12px;
            padding: 2px 4px; border-radius: 4px; line-height: 1; color: var(--t3);
            transition: background .12s ease-out, color .12s ease-out, transform .1s ease-out;
        }
        .db8-btn:hover   { background: #2a2a2a; }
        .db8-btn:active  { transform: scale(.92); }
        .db8-btn.fav:hover { color: var(--gold); }
        .db8-btn.fav.on    { color: var(--gold); opacity: 1 !important; }
        .db8-btn.sw:hover  { color: var(--acc); }
        .db8-btn.sw.on     { color: var(--acc); opacity: 1 !important; }
        .db8-btn.del:hover { color: var(--red); }

        /* ---- Custom dork form ---- */
        .db8-cf { padding: 12px; display: flex; flex-direction: column; gap: 8px; border-bottom: 1px solid var(--line); }
        .db8-cf input {
            background: var(--bg-2); border: 1px solid #2a2a2a; border-radius: 4px;
            color: var(--t1); padding: 6px 8px; font-size: 12px; outline: none;
            width: 100%; box-sizing: border-box;
            transition: border-color .15s ease-out;
        }
        .db8-cf input::placeholder, .db8-dp-in::placeholder { color: var(--t3); }
        .db8-cf input:focus { border-color: var(--acc); }
        .db8-cf-save {
            background: var(--acc); color: #000; border: none; border-radius: 4px;
            padding: 6px 12px; font-size: 12px; cursor: pointer;
            font-weight: bold; align-self: flex-start;
            transition: background .15s ease-out, transform .1s ease-out;
        }
        .db8-cf-save:hover  { background: var(--acc-hi); }
        .db8-cf-save:active { background: var(--acc-lo); transform: scale(.96); }
        .db8-add-new {
            padding: 8px 12px; text-align: center; color: var(--t2);
            font-size: 11px; cursor: pointer; border-top: 1px dashed var(--line);
            transition: color .15s ease-out, background .15s ease-out;
        }
        .db8-add-new:hover { color: var(--acc); background: var(--hover); }

        /* ---- Domain prompt ---- */
        .db8-dp {
            padding: 8px 12px; background: #13131e; border-bottom: 1px solid var(--line);
            display: flex; align-items: center; gap: 8px; flex-shrink: 0;
        }
        .db8-dp-in {
            flex: 1; background: var(--bg-2); border: 1px solid #2a2a2a; border-radius: 4px;
            color: var(--t1); padding: 4px 8px; font-size: 12px; outline: none;
            transition: border-color .15s ease-out;
        }
        .db8-dp-in:focus { border-color: var(--acc); }
        .db8-dp-ok {
            background: var(--acc); color: #000; border: none; border-radius: 4px;
            padding: 4px 12px; font-size: 12px; cursor: pointer; font-weight: bold;
            transition: background .15s ease-out, transform .1s ease-out;
        }
        .db8-dp-ok:hover  { background: var(--acc-hi); }
        .db8-dp-ok:active { background: var(--acc-lo); transform: scale(.96); }

        /* ---- Empty state ---- */
        .db8-empty { padding: 12px; color: var(--t3); text-align: center; font-size: 12px; }

        /* ---- Sweep bar ---- */
        .db8-sweep {
            position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
            background: #161616; border: 1px solid #2a2a2a; border-radius: 20px;
            padding: 4px 12px; display: flex; align-items: center; gap: 8px;
            z-index: 99998; box-shadow: 0 4px 12px rgba(0,0,0,.55);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 12px; white-space: nowrap;
        }
        .db8-sw-label { color: var(--t3); font-size: 10px; letter-spacing: .04em; }
        .db8-sw-nav {
            background: none; border: none; cursor: pointer;
            color: var(--t2); font-size: 12px; padding: 2px 8px; border-radius: 12px;
            transition: background .12s ease-out, color .12s ease-out, transform .1s ease-out;
        }
        .db8-sw-nav:hover  { background: #2a2a2a; color: #fff; }
        .db8-sw-nav:active { transform: scale(.92); }
        .db8-sw-key { color: var(--acc); font-family: var(--mono); font-size: 11px; max-width: 190px; overflow: hidden; text-overflow: ellipsis; }
        .db8-sw-pos { color: var(--t3); font-size: 10px; min-width: 28px; text-align: center; }
        .db8-sw-sep { color: #333; }
        .db8-sw-auto {
            display: flex; align-items: center; gap: 4px;
            color: var(--t2); cursor: pointer; font-size: 10px; user-select: none;
        }
        .db8-sw-auto input { accent-color: var(--acc); cursor: pointer; margin: 0; }
        .db8-sw-clear {
            background: none; border: none; cursor: pointer; color: var(--t3);
            font-size: 11px; padding: 2px 4px; border-radius: 4px;
            transition: color .12s ease-out, background .12s ease-out;
        }
        .db8-sw-clear:hover { color: var(--red); background: #2a2a2a; }

        /* ---- Motion (skipped for reduced-motion users) ---- */
        @media (prefers-reduced-motion: no-preference) {
            @keyframes db8-pop    { from { opacity: 0; transform: translateY(-4px); } }
            @keyframes db8-pop-up { from { opacity: 0; transform: translateX(-50%) translateY(8px); } }
            .db8-menu  { animation: db8-pop .16s ease-out; }
            .db8-sweep { animation: db8-pop-up .2s ease-out; }
        }
    `;

    // =========================================================================
    // 4. CLASS
    // =========================================================================
    class DorkItB8 {
        constructor() {
            // DOM refs
            this.icon     = null;
            this.menu     = null;
            this.listEl   = null;
            this.titleEl  = null;
            this.backEl   = null;
            this.sweepBar = null;
            this.input    = null;

            // Menu state
            this.isOpen     = false;
            this.isDragging = false;
            this.dragStart  = { x: 0, y: 0 };
            this.menuStart  = { x: 0, y: 0 };
            this.view       = 'cats';   // 'cats' | 'dorks' | 'filter' | 'form' | 'domain'
            this.activeCat  = null;
            this._boundInput = null;

            // Feature state (backed by localStorage)
            this.favorites = ls.get('favs')   || [];
            this.recent    = ls.get('recent')  || [];
            this.custom    = ls.get('custom')  || [];

            // Sweep (backed by sessionStorage so it survives Google's page navigations)
            const sv        = ss.get('sweep')  || {};
            this.sweepQ     = sv.q   || [];
            this.sweepIdx   = sv.idx || 0;
            this.sweepCtx   = sv.ctx || null;   // { before: string }
            this.sweepAuto  = ls.get('swAuto') ?? true;

            this.init();
        }

        // ---- Bootstrap ----

        init() {
            this._injectCSS();
            this._buildUI();
            this._globalKeys();
            this._watchDOM();
        }

        _injectCSS() {
            const s = document.createElement('style');
            s.textContent = CSS;
            document.head.appendChild(s);
        }

        // ---- UI construction ----

        _buildUI() {
            // Floating icon
            this.icon = document.createElement('div');
            this.icon.className = 'db8-icon';
            this.icon.textContent = '⠿';
            this.icon.title = 'Dork it B8 (Ctrl+Shift+H)';
            this.icon.style.display = 'none';
            document.body.appendChild(this.icon);

            // Menu
            this.menu = document.createElement('div');
            this.menu.className = 'db8-menu';

            // Header
            const hdr = document.createElement('div');
            hdr.className = 'db8-hdr';

            const hdrL = document.createElement('div');
            hdrL.className = 'db8-hdr-l';

            this.backEl = document.createElement('span');
            this.backEl.className = 'db8-back';
            this.backEl.textContent = '←';
            this.backEl.title = 'Back (Esc)';
            this.backEl.style.display = 'none';

            this.titleEl = document.createElement('span');
            this.titleEl.className = 'db8-title';
            this.titleEl.textContent = '⠿ DORK IT B8';

            const closeEl = document.createElement('span');
            closeEl.className = 'db8-close';
            closeEl.textContent = '✕';
            closeEl.title = 'Close';

            hdrL.append(this.backEl, this.titleEl);
            hdr.append(hdrL, closeEl);

            // List
            this.listEl = document.createElement('div');
            this.listEl.className = 'db8-list';

            this.menu.append(hdr, this.listEl);
            document.body.appendChild(this.menu);

            // Sweep bar (separate element, stays visible over Google results)
            this._buildSweepBar();

            // ---- Events ----
            this.icon.addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation(); this.toggle();
            });
            closeEl.addEventListener('click', () => this.hide());
            this.backEl.addEventListener('mousedown', (e) => {
                e.preventDefault(); this.goBack();
            });

            // Drag
            hdr.addEventListener('mousedown', (e) => {
                if (e.target === closeEl || e.target === this.backEl) return;
                this.isDragging = true;
                this.dragStart = { x: e.clientX, y: e.clientY };
                const r = this.menu.getBoundingClientRect();
                this.menuStart = { x: r.left, y: r.top };
                e.preventDefault();
            });
            document.addEventListener('mousemove', (e) => {
                if (!this.isDragging) return;
                this.menu.style.left  = (this.menuStart.x + e.clientX - this.dragStart.x) + 'px';
                this.menu.style.top   = (this.menuStart.y + e.clientY - this.dragStart.y) + 'px';
                this.menu.style.right = 'auto';
            });
            document.addEventListener('mouseup', () => { this.isDragging = false; });

            // Keyboard navigation inside the list
            this.listEl.addEventListener('keydown', (e) => {
                if (!this.isOpen) return;
                const items = [...this.listEl.querySelectorAll('[tabindex="0"]')];
                const idx   = items.indexOf(document.activeElement);
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    (items[idx + 1] || items[0])?.focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    (items[idx - 1] || items[items.length - 1])?.focus();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    this.view !== 'cats' ? this.goBack() : this.hide();
                }
            });
        }

        // ---- Sweep bar ----

        _buildSweepBar() {
            this.sweepBar = document.createElement('div');
            this.sweepBar.className = 'db8-sweep';
            this.sweepBar.style.display = 'none';
            this.sweepBar.innerHTML =
                '<span class="db8-sw-label">SWEEP</span>' +
                '<button class="db8-sw-nav" id="db8-prev" title="Prev (Ctrl+Shift+[)">&#9664;&#xFE0E;</button>' +
                '<span class="db8-sw-key"></span>' +
                '<span class="db8-sw-pos"></span>' +
                '<button class="db8-sw-nav" id="db8-next" title="Next (Ctrl+Shift+])">&#9654;&#xFE0E;</button>' +
                '<span class="db8-sw-sep">|</span>' +
                '<label class="db8-sw-auto" title="Auto-submit on sweep">' +
                    '<input type="checkbox" class="db8-sw-auto-chk"' + (this.sweepAuto ? ' checked' : '') + '> Auto' +
                '</label>' +
                '<button class="db8-sw-clear" title="Clear sweep queue">&#x2715;</button>';

            this.sweepBar.querySelector('#db8-prev').addEventListener('click', () => this.sweepGo(-1));
            this.sweepBar.querySelector('#db8-next').addEventListener('click', () => this.sweepGo(1));
            this.sweepBar.querySelector('.db8-sw-clear').addEventListener('click', () => this.clearSweep());
            this.sweepBar.querySelector('.db8-sw-auto-chk').addEventListener('change', (e) => {
                this.sweepAuto = e.target.checked;
                ls.set('swAuto', this.sweepAuto);
            });

            document.body.appendChild(this.sweepBar);
            this._syncSweepBar();   // restore state if session had an active sweep
        }

        // ---- Global keyboard shortcuts ----

        _globalKeys() {
            document.addEventListener('keydown', (e) => {
                if (!e.ctrlKey || !e.shiftKey) return;
                // e.code matches the physical key: with Shift held, e.key would be '{' / '}'
                if (e.code === 'KeyH')         { e.preventDefault(); this.toggle(); }
                if (e.code === 'BracketRight') { e.preventDefault(); this.sweepGo(1); }
                if (e.code === 'BracketLeft')  { e.preventDefault(); this.sweepGo(-1); }
            });
        }

        // ---- DOM watcher ----

        _watchDOM() {
            this._findInput();
            // Google mutates the page constantly, so coalesce lookups to one per frame
            let queued = false;
            new MutationObserver(() => {
                if (queued) return;
                queued = true;
                requestAnimationFrame(() => { queued = false; this._findInput(); });
            }).observe(document.body, { childList: true, subtree: true });
            setInterval(() => this._iconPos(), 500);
        }

        _findInput() {
            const el = document.querySelector('textarea[name="q"], input[name="q"]');
            if (el && el !== this.input) {
                this.input = el;
                this._bindInput(el);
                this.icon.style.display = 'flex';
            } else if (!el) {
                if (this.icon) this.icon.style.display = 'none';
                this.input = null;
                if (this.isOpen) this.hide();
            }
        }

        _bindInput(input) {
            if (this._boundInput) input.removeEventListener('input', this._boundInput);
            this._boundInput = () => {
                const word = this._wordAt();
                if (word.length > 0) {
                    if (!this.isOpen) this._positionMenu();
                    this.menu.style.display = 'flex';
                    this.isOpen = true;
                    this.renderFilter(word);
                } else if (this.isOpen) {
                    this.renderCats();
                }
            };
            input.addEventListener('input', this._boundInput);
            input.addEventListener('keydown', (e) => {
                // Tab when menu is open → jump focus into the list
                if (e.key === 'Tab' && this.isOpen) {
                    e.preventDefault();
                    this.listEl.querySelector('[tabindex="0"]')?.focus();
                }
                if (e.key === 'Escape' && this.isOpen) this.hide();
            });
        }

        _iconPos() {
            if (!this.input || !this.icon) return;
            const r = this.input.getBoundingClientRect();
            this.icon.style.top  = (r.top + r.height / 2 - 12) + 'px';
            this.icon.style.left = (r.right - 30) + 'px';
        }

        // ---- Word helpers ----

        _wordAt() {
            if (!this.input) return '';
            const val = this.input.value, pos = this.input.selectionStart;
            let s = pos;
            while (s > 0 && val[s - 1] !== ' ') s--;
            return val.substring(s, pos);
        }

        _wordRange() {
            if (!this.input) return { start: 0, end: 0 };
            const val = this.input.value, pos = this.input.selectionStart;
            let s = pos;
            while (s > 0 && val[s - 1] !== ' ') s--;
            return { start: s, end: pos };   // end = cursor, never walk right
        }

        // ---- Header ----

        _setHdr(title, showBack) {
            this.titleEl.textContent = title;
            this.backEl.style.display = showBack ? 'inline' : 'none';
        }

        // =========================================================================
        // RENDER: category list
        // =========================================================================
        renderCats() {
            this.view = 'cats';
            this.activeCat = null;
            this._setHdr('⠿ DORK IT B8', false);
            this.listEl.innerHTML = '';

            // Virtual categories appear at the top
            const virt = [];
            if (this.recent.length)    virt.push({ id: '_rec',  label: 'Recent',    cat: 'Rec',    items: this.recent,    virt: true });
            if (this.favorites.length) virt.push({ id: '_fav',  label: 'Favorites', cat: 'Fav',    items: this.favorites, virt: true });
            virt.push(                            { id: '_cust', label: 'Custom',    cat: 'Custom', items: this.custom,    virt: true });

            [...virt, ...DORK_DB].forEach(cat => {
                const row = document.createElement('div');
                row.className = 'db8-cat' + (cat.virt ? ' virt' : '');
                row.setAttribute('tabindex', '0');
                row.innerHTML =
                    '<div class="db8-cat-l">' +
                        '<span class="db8-cat-name">' + esc(cat.label) + '</span>' +
                        '<span class="db8-cat-cnt">'  + esc(cat.items.length) + '</span>' +
                    '</div>' +
                    '<span class="db8-cat-arr">&#x203A;</span>';

                const open = () => this.renderDorks(cat);
                row.addEventListener('mousedown', (e) => { e.preventDefault(); open(); });
                row.addEventListener('keydown',   (e) => { if (e.key === 'Enter') open(); });
                this.listEl.appendChild(row);
            });
        }

        // =========================================================================
        // RENDER: dork list for a selected category
        // =========================================================================
        renderDorks(cat) {
            this.view = 'dorks';
            this.activeCat = cat;
            this._setHdr(cat.label, true);
            this.listEl.innerHTML = '';

            if (cat.items.length === 0 && cat.id !== '_cust') {
                this.listEl.innerHTML = '<div class="db8-empty">Nothing here yet</div>';
            }

            cat.items.forEach(item => {
                this.listEl.appendChild(
                    this._mkItem(item, { canDel: cat.id === '_cust' })
                );
            });

            // Custom category always shows an "Add" button at the bottom
            if (cat.id === '_cust') {
                const addRow = document.createElement('div');
                addRow.className = 'db8-add-new';
                addRow.textContent = '＋ Add custom dork';
                addRow.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    this.renderCustomForm();
                });
                this.listEl.appendChild(addRow);
            }
        }

        // =========================================================================
        // RENDER: flat filtered results while typing
        // =========================================================================
        renderFilter(q) {
            this.view = 'filter';
            const ql = q.toLowerCase();

            // Build a deduplicated pool: custom + favorites + built-in
            const seen = new Set();
            const pool = [
                ...this.custom.map(i => ({ ...i, catLabel: 'Custom' })),
                ...DORK_FLAT,
            ].filter(i => {
                if (seen.has(i.key)) return false;
                seen.add(i.key);
                return i.key.toLowerCase().includes(ql) ||
                       i.desc.toLowerCase().includes(ql) ||
                       (i.catLabel || '').toLowerCase().includes(ql);
            });

            this._setHdr('⠿ DORK IT B8', false);
            this.listEl.innerHTML = '';

            if (pool.length === 0) {
                this.listEl.innerHTML = '<div class="db8-empty">No matches</div>';
                return;
            }

            pool.forEach(item => this.listEl.appendChild(this._mkItem(item, { showCat: true })));
        }

        // =========================================================================
        // RENDER: custom dork add form
        // =========================================================================
        renderCustomForm() {
            this.view = 'form';
            this._setHdr('Add Custom Dork', true);
            this.listEl.innerHTML = '';

            const form = document.createElement('div');
            form.className = 'db8-cf';
            form.innerHTML =
                '<input class="db8-ckey" placeholder=\'Dork e.g. filetype:pdf intext:"secret"\' spellcheck="false" />' +
                '<input class="db8-cdesc" placeholder="Description" spellcheck="false" />' +
                '<button class="db8-cf-save">Save</button>';

            const ki = form.querySelector('.db8-ckey');
            const di = form.querySelector('.db8-cdesc');
            const sb = form.querySelector('.db8-cf-save');

            const save = () => {
                const k = ki.value.trim(), d = di.value.trim();
                if (!k) return;
                this.custom.push({ key: k, desc: d || '(no description)', cat: 'Custom', catLabel: 'Custom' });
                ls.set('custom', this.custom);
                // Navigate back to custom list
                this.renderDorks({ id: '_cust', label: 'Custom', cat: 'Custom', items: this.custom, virt: true });
            };

            sb.addEventListener('mousedown', (e) => { e.preventDefault(); save(); });
            ki.addEventListener('keydown',   (e) => { if (e.key === 'Enter') { e.preventDefault(); di.focus(); } });
            di.addEventListener('keydown',   (e) => { if (e.key === 'Enter') { e.preventDefault(); save(); } });

            this.listEl.appendChild(form);
            setTimeout(() => ki.focus(), 50);
        }

        // =========================================================================
        // ITEM FACTORY: builds a dork row with star + sweep + optional delete
        // =========================================================================
        _mkItem(item, opts = {}) {
            const div = document.createElement('div');
            div.className = 'db8-item';
            div.setAttribute('tabindex', '0');

            const isFav   = this._isFav(item);
            const inSweep = this._inSweep(item);

            // Body (key + tag + desc): clicking inserts
            const body = document.createElement('div');
            body.className = 'db8-item-body';
            body.innerHTML =
                '<span class="db8-key">' + esc(item.key) + '</span>' +
                (opts.showCat ? '<span class="db8-tag">' + esc(item.cat) + '</span>' : '') +
                '<span class="db8-desc">' + esc(item.desc) + '</span>';

            // Action buttons
            const acts = document.createElement('div');
            acts.className = 'db8-item-acts';

            const favBtn = document.createElement('button');
            favBtn.className = 'db8-btn fav' + (isFav ? ' on' : '');
            favBtn.textContent = isFav ? '★' : '☆';
            favBtn.title = 'Favorite';

            const swBtn = document.createElement('button');
            swBtn.className = 'db8-btn sw' + (inSweep ? ' on' : '');
            swBtn.textContent = inSweep ? '⊙' : '⊕';
            swBtn.title = 'Add to sweep queue';

            acts.append(favBtn, swBtn);

            if (opts.canDel) {
                const delBtn = document.createElement('button');
                delBtn.className = 'db8-btn del';
                delBtn.textContent = '×';
                delBtn.title = 'Delete';
                delBtn.addEventListener('mousedown', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    this.custom = this.custom.filter(c => c.key !== item.key);
                    ls.set('custom', this.custom);
                    if (this.activeCat?.id === '_cust') {
                        this.activeCat.items = this.custom;
                        this.renderDorks(this.activeCat);
                    }
                });
                acts.appendChild(delBtn);
            }

            div.append(body, acts);

            // Insert on body click or Enter key
            const doInsert = () => this.insert(item.key, item);
            body.addEventListener('mousedown', (e) => { e.preventDefault(); doInsert(); });
            div.addEventListener('keydown',    (e) => { if (e.key === 'Enter') { e.preventDefault(); doInsert(); } });

            // Toggle favorite
            favBtn.addEventListener('mousedown', (e) => {
                e.preventDefault(); e.stopPropagation();
                this._toggleFav(item);
                const now = this._isFav(item);
                favBtn.className = 'db8-btn fav' + (now ? ' on' : '');
                favBtn.textContent = now ? '★' : '☆';
                // Refresh if currently viewing favorites
                if (this.activeCat?.id === '_fav') {
                    this.activeCat.items = this.favorites;
                    this.renderDorks(this.activeCat);
                }
            });

            // Toggle sweep
            swBtn.addEventListener('mousedown', (e) => {
                e.preventDefault(); e.stopPropagation();
                this._toggleSweep(item);
                const now = this._inSweep(item);
                swBtn.className = 'db8-btn sw' + (now ? ' on' : '');
                swBtn.textContent = now ? '⊙' : '⊕';
            });

            return div;
        }

        // ---- Navigation ----

        goBack() {
            // From custom form → back to custom dork list
            if (this.view === 'form') {
                this.renderDorks({ id: '_cust', label: 'Custom', cat: 'Custom', items: this.custom, virt: true });
                return;
            }
            this.renderCats();
        }

        // =========================================================================
        // INSERT
        // =========================================================================
        insert(key, item) {
            if (!this.input) return;
            if (key.includes('[domain]')) { this.promptDomain(key); return; }
            this._doInsert(key, item);
        }

        _doInsert(key, item) {
            this.input.focus();

            const val            = this.input.value;
            const { start, end } = this._wordRange();
            const prefix = (start > 0 && val[start - 1] !== ' ') ? ' ' : '';
            const before = val.substring(0, start);
            const after  = val.substring(end);
            const suffix = (!after.length || after[0] !== ' ') ? ' ' : '';
            const final  = before + prefix + key + suffix + after;

            const proto  = this.input.nodeName === 'TEXTAREA'
                ? window.HTMLTextAreaElement.prototype
                : window.HTMLInputElement.prototype;
            const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
            setter ? setter.call(this.input, final) : (this.input.value = final);

            this.input.dispatchEvent(new Event('input',  { bubbles: true }));
            this.input.dispatchEvent(new Event('change', { bubbles: true }));

            const pos = before.length + prefix.length + key.length + suffix.length;
            this.input.setSelectionRange(pos, pos);

            // Track recent usage
            if (item) this._addToRecent(item);

            // Return to category list (overrides any filter re-render from the dispatched input event)
            this.renderCats();
        }

        // ---- Domain prompt ----

        promptDomain(tpl) {
            this.view = 'domain';
            this._setHdr('Enter domain', true);
            this.listEl.innerHTML = '';

            const row = document.createElement('div');
            row.className = 'db8-dp';
            row.innerHTML =
                '<input class="db8-dp-in" placeholder="example.com" spellcheck="false" />' +
                '<button class="db8-dp-ok">OK</button>';

            const inp = row.querySelector('.db8-dp-in');
            const ok  = row.querySelector('.db8-dp-ok');
            const go  = () => {
                const d = inp.value.trim();
                if (!d) return;
                this._doInsert(tpl.replaceAll('[domain]', d));
            };

            ok.addEventListener('mousedown',  (e) => { e.preventDefault(); go(); });
            inp.addEventListener('keydown',   (e) => { if (e.key === 'Enter') go(); });

            this.listEl.appendChild(row);
            setTimeout(() => inp.focus(), 50);
        }

        // ---- Show / hide ----

        toggle() { this.isOpen ? this.hide() : this.show(); }

        show() {
            if (!this.input) return;
            this._positionMenu();
            this.menu.style.display = 'flex';
            this.isOpen = true;
            const w = this._wordAt();
            w.length > 0 ? this.renderFilter(w) : this.renderCats();
        }

        hide() {
            this.menu.style.display = 'none';
            this.isOpen = false;
        }

        _positionMenu() {
            if (!this.input) return;
            const r    = this.input.getBoundingClientRect();
            let left   = r.right + 10;
            const top  = r.top;
            if (left + 300 > window.innerWidth) left = r.left - 310;
            this.menu.style.left = left + 'px';
            this.menu.style.top  = top  + 'px';
        }

        // =========================================================================
        // FAVORITES
        // =========================================================================
        _isFav(item) {
            return this.favorites.some(f => f.key === item.key);
        }

        _toggleFav(item) {
            if (this._isFav(item)) {
                this.favorites = this.favorites.filter(f => f.key !== item.key);
            } else {
                this.favorites.unshift({
                    key: item.key, desc: item.desc || '(no description)',
                    cat: item.cat || 'Fav', catLabel: 'Favorites'
                });
            }
            ls.set('favs', this.favorites);
        }

        // =========================================================================
        // RECENT
        // =========================================================================
        _addToRecent(item) {
            if (!item?.key) return;
            this.recent = this.recent.filter(r => r.key !== item.key);
            this.recent.unshift({
                key: item.key, desc: item.desc || '(no description)',
                cat: item.cat || 'Rec', catLabel: 'Recent'
            });
            if (this.recent.length > 10) this.recent.pop();
            ls.set('recent', this.recent);
        }

        // =========================================================================
        // SWEEP
        //
        // How it works:
        //   1. User types a base query (e.g. "site:example.com ")
        //   2. From any dork list, they click ⊕ on multiple dorks to queue them
        //   3. The sweep bar appears at the bottom of the screen
        //   4. ◀ / ▶ (or Ctrl+Shift+[ / ]) swaps the queued dork into the search
        //      bar, replacing the previous one, and optionally auto-submits
        //   5. Sweep state persists in sessionStorage so it survives Google's page
        //      navigation within the same tab
        // =========================================================================
        _inSweep(item) {
            return this.sweepQ.some(i => i.key === item.key);
        }

        _toggleSweep(item) {
            if (this._inSweep(item)) {
                this.sweepQ = this.sweepQ.filter(i => i.key !== item.key);
                if (this.sweepIdx >= this.sweepQ.length) this.sweepIdx = 0;
            } else {
                // Capture the text before the current word as the sweep context
                // (done once, on the first item added)
                if (this.sweepQ.length === 0 && this.input) {
                    const { start } = this._wordRange();
                    this.sweepCtx = { before: this.input.value.substring(0, start) };
                }
                this.sweepQ.push({ key: item.key, desc: item.desc, cat: item.cat });
            }
            this._saveSweep();
            this._syncSweepBar();
        }

        sweepGo(dir) {
            if (!this.sweepQ.length) return;
            this.sweepIdx = (this.sweepIdx + dir + this.sweepQ.length) % this.sweepQ.length;
            this._saveSweep();
            this._applySweep();
            this._syncSweepBar();
        }

        _applySweep() {
            if (!this.input || !this.sweepCtx) return;
            const item   = this.sweepQ[this.sweepIdx];
            const newVal = this.sweepCtx.before + item.key + ' ';

            const proto  = this.input.nodeName === 'TEXTAREA'
                ? window.HTMLTextAreaElement.prototype
                : window.HTMLInputElement.prototype;
            const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
            setter ? setter.call(this.input, newVal) : (this.input.value = newVal);

            this.input.dispatchEvent(new Event('input',  { bubbles: true }));
            this.input.dispatchEvent(new Event('change', { bubbles: true }));
            this.input.setSelectionRange(newVal.length, newVal.length);
            this.input.focus();

            if (this.sweepAuto) setTimeout(() => this._submitSearch(), 150);
        }

        _submitSearch() {
            if (!this.input) return;
            // Primary: simulate Enter key on the search input
            this.input.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter', code: 'Enter', keyCode: 13,
                which: 13, bubbles: true, cancelable: true
            }));
            // Fallback: the submit control inside the search form (language-independent)
            setTimeout(() => {
                const form = this.input && this.input.closest('form');
                const btn  = form
                    ? form.querySelector('input[name="btnK"], button[type="submit"], input[type="submit"], button[aria-label="Google Search"]')
                    : document.querySelector('input[name="btnK"]');
                btn?.click();
            }, 60);
        }

        clearSweep() {
            this.sweepQ   = [];
            this.sweepIdx = 0;
            this.sweepCtx = null;
            this._saveSweep();
            this._syncSweepBar();
        }

        _saveSweep() {
            ss.set('sweep', { q: this.sweepQ, idx: this.sweepIdx, ctx: this.sweepCtx });
        }

        _syncSweepBar() {
            if (!this.sweepBar) return;
            const empty = this.sweepQ.length === 0;
            this.sweepBar.style.display = empty ? 'none' : 'flex';

            // Icon tint when sweep is active
            if (this.icon) {
                this.icon.classList.toggle('sweep-on', !empty);
            }

            if (empty) return;

            const item = this.sweepQ[this.sweepIdx];
            const k    = item.key;
            this.sweepBar.querySelector('.db8-sw-key').textContent =
                k.length > 26 ? k.slice(0, 23) + '…' : k;
            this.sweepBar.querySelector('.db8-sw-pos').textContent =
                (this.sweepIdx + 1) + '/' + this.sweepQ.length;
        }
    }

    new DorkItB8();

})();