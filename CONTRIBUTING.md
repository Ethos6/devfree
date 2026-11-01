# Contributing to devfree

Thanks for helping keep this list accurate. Accuracy matters more than size here, so every change needs a source.

## What belongs on the list

- **Hosted services** that developers use to build, run or ship software.
- A **permanent free tier**. Time-limited trials don't count. Sign-up credits are only listed for the large cloud platforms.
- Limits that are **published by the provider** on an official page.

What doesn't belong: self-hosted downloads, generic "toolbox" sites (converters, calculators), and services whose free plan isn't documented anywhere.

## Add or update a service

1. Find the right file in [`data/`](data). Each file is one category.
2. Add or edit the entry:

   ```json
   {
     "id": "example-db",
     "name": "Example DB",
     "url": "https://example.com",
     "pricing_url": "https://example.com/pricing",
     "description": "Managed Postgres with branching.",
     "free_tier": ["1 project", "0.5 GB storage", "50 hours compute per month"],
     "credit_card_required": false,
     "notes": "Free projects pause after 7 days of inactivity.",
     "tags": ["postgres"],
     "open_source": false,
     "checked": "2026-11-01"
   }
   ```

   - `free_tier`: copy the limits as the provider states them. Keep each line short.
   - `pricing_url`: the official page where those limits are written. Not a blog post or a third-party list.
   - `checked`: the date you verified the limits (today).
   - `credit_card_required`: only include it if the provider says so explicitly.
   - `description`: one sentence about what the service does, in your own words. No marketing language.
3. Run `npm run format && npm run check`. Node.js 20+ is all you need; there are no dependencies.
4. Open a pull request with the source link.

## Re-checking entries

Once a month a bot opens an issue listing entries that haven't been checked for 6 months. Pick one, open its pricing page, update the limits if needed, set `checked` to today and open a pull request. Re-checks are as valuable as new entries.

## Removing a service

If a free tier has ended or the service has shut down, open a pull request that removes the entry and link to the announcement or the current pricing page.

## Disclosure

If you work for a service you're adding, say so in the pull request. It's fine to contribute; we just want to know.
