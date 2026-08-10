// usePageSEO — zero-dependency per-page SEO manager for React 19.
//
// Given a page's title / description / canonical / OG image / structured data,
// this hook syncs them to the document <head> on mount and restores the
// previous values on unmount so the next page starts clean.
//
// Used on LandingPage, BlogArticle, and can be dropped into any new page for
// unique per-URL metadata that Googlebot's headless-Chrome renderer picks up.

import { useEffect } from 'react';

const DEFAULT_OG_IMAGE = 'https://cloudcanvas.co/screenshots/app-overview.png';

function setMeta(attr, key, value) {
  if (!value) return null;
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  const created = !tag;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  const prev = tag.getAttribute('content');
  tag.setAttribute('content', value);
  return { tag, prev, created };
}

function setLink(rel, href) {
  if (!href) return null;
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  const created = !tag;
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  const prev = tag.getAttribute('href');
  tag.setAttribute('href', href);
  return { tag, prev, created };
}

function setJsonLd(id, obj) {
  if (!obj) return null;
  let tag = document.getElementById(id);
  const created = !tag;
  if (!tag) {
    tag = document.createElement('script');
    tag.type = 'application/ld+json';
    tag.id = id;
    document.head.appendChild(tag);
  }
  const prev = tag.textContent;
  tag.textContent = JSON.stringify(obj);
  return { tag, prev, created };
}

/**
 * @param {{
 *   title?: string,
 *   description?: string,
 *   canonical?: string,
 *   image?: string,
 *   keywords?: string,
 *   type?: 'website' | 'article',
 *   robots?: string,
 *   structuredData?: object | object[] | null,
 * }} options
 */
export default function usePageSEO(options) {
  useEffect(() => {
    const {
      title,
      description,
      canonical,
      image = DEFAULT_OG_IMAGE,
      keywords,
      type = 'website',
      robots,
      structuredData,
    } = options || {};

    // --- Snapshot for restore ---
    const prevTitle = document.title;
    const changes = [];

    if (title) document.title = title;

    if (description) {
      changes.push(setMeta('name', 'description', description));
      changes.push(setMeta('property', 'og:description', description));
      changes.push(setMeta('name', 'twitter:description', description));
    }
    if (title) {
      changes.push(setMeta('property', 'og:title', title));
      changes.push(setMeta('name', 'twitter:title', title));
    }
    if (keywords) {
      changes.push(setMeta('name', 'keywords', keywords));
    }
    if (canonical) {
      changes.push(setLink('canonical', canonical));
      changes.push(setMeta('property', 'og:url', canonical));
    }
    if (image) {
      changes.push(setMeta('property', 'og:image', image));
      changes.push(setMeta('name', 'twitter:image', image));
    }
    if (type) {
      changes.push(setMeta('property', 'og:type', type));
    }
    if (robots) {
      changes.push(setMeta('name', 'robots', robots));
    }

    // Structured data — accept single object or array of objects
    let jsonLdRefs = [];
    if (structuredData) {
      const arr = Array.isArray(structuredData) ? structuredData : [structuredData];
      arr.forEach((obj, i) => {
        const ref = setJsonLd(`page-jsonld-${i}`, obj);
        if (ref) jsonLdRefs.push(ref);
      });
    }

    return () => {
      // Restore document.title
      document.title = prevTitle;

      // Restore or remove modified meta / link tags
      for (const c of changes) {
        if (!c) continue;
        const { tag, prev, created } = c;
        if (created) {
          tag.remove();
        } else if (prev != null) {
          if (tag.tagName === 'LINK') tag.setAttribute('href', prev);
          else tag.setAttribute('content', prev);
        }
      }

      // Remove any page-scoped JSON-LD blocks so the next route starts clean
      for (const c of jsonLdRefs) {
        if (!c) continue;
        if (c.created) c.tag.remove();
        else c.tag.textContent = c.prev || '';
      }
    };
  }, [JSON.stringify(options)]); // eslint-disable-line react-hooks/exhaustive-deps
}
