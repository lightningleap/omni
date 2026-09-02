# UNRWLY — Domain verify karne ke liye DNS records add karne hain

Email feature (order confirmation, newsletter, contact form) ka code ready hai.
Live karne ke liye domain `unrwly.com` ko Resend pe verify karna hai —
uske liye neeche diye **4 DNS records** domain ki DNS settings mein add karne hain.

`unrwly.com` ka DNS **Whois.com** pe manage hota hai
(nameservers ns1.whois.com … ns4.whois.com).

---

## Add kaise karna hai (Whois.com)

1. **whois.com** pe login karo (jis account se `unrwly.com` khareeda tha)
2. **My Account → Domains → unrwly.com** kholo
3. **"Manage DNS"** / **"DNS & Nameservers"** / **"Advanced DNS"** section mein jao
4. **"Add Record"** se neeche wale 4 records ek-ek karke add karo
5. Sab add hone ke baad Resend pe wapas jaake **"Verify"** dabao
6. 15–30 min mein verify ho jaayega ✅

> ⚠️ Zaroori: har record ka **poora value** chahiye. Resend ke domain page pe
> value kati hui (`[...]`) dikhti hai — us line ke aage **copy icon** dabane se
> POORA value copy hota hai. Wahi paste karna.

> ⚠️ "Name/Host" field mein sirf `send` / `resend._domainkey` / `_dmarc` likhna —
> pura `send.unrwly.com` mat likhna (domain apne aap jud jaata hai).

---

## 4 Records

### 1. DKIM (TXT)
| Field | Value |
|-------|-------|
| Type | TXT |
| Name/Host | `resend._domainkey` |
| Value | `p=MIGfMA0GCSqG…EwAqX/QIDAQAB` *(Resend se poora copy karo)* |
| TTL | Auto |

### 2. SPF (MX)
| Field | Value |
|-------|-------|
| Type | MX |
| Name/Host | `send` |
| Value | `feedback-smtp.…amazonses.com` *(Resend se poora copy karo)* |
| Priority | 10 |
| TTL | Auto |

### 3. SPF (TXT)
| Field | Value |
|-------|-------|
| Type | TXT |
| Name/Host | `send` |
| Value | `v=spf1 include:…nses.com ~all` *(Resend se poora copy karo)* |
| TTL | Auto |

### 4. DMARC (TXT)
| Field | Value |
|-------|-------|
| Type | TXT |
| Name/Host | `_dmarc` |
| Value | `v=DMARC1; p=none;` |
| TTL | Auto |

---

Sab records ka **Status "Not Started"** hai abhi — add karne ke baad ye
apne aap **"Verified" (green)** ho jaayega.
