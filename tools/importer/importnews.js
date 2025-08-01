/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */
/* eslint-disable no-console */
import tableStripedBordered6Parser from './parsers/tableStripedBordered6.js';
import columns2Parser from './parsers/columns2.js';
import cards9Parser from './parsers/cards9.js';
import cardsNoImages10Parser from './parsers/cardsNoImages10.js';
import columns11Parser from './parsers/columns11.js';
import columns8Parser from './parsers/columns8.js';
import hero5Parser from './parsers/hero5.js';
import columns14Parser from './parsers/columns14.js';
import cards13Parser from './parsers/cards13.js';
import carousel7Parser from './parsers/carousel7.js';
import search17Parser from './parsers/search17.js';
import hero15Parser from './parsers/hero15.js';
import columns22Parser from './parsers/columns22.js';
import tableStripedBordered24Parser from './parsers/tableStripedBordered24.js';
import carousel23Parser from './parsers/carousel23.js';
import cardsNoImages21Parser from './parsers/cardsNoImages21.js';
import columns1Parser from './parsers/columns1.js';
import columns26Parser from './parsers/columns26.js';
import cardsNoImages25Parser from './parsers/cardsNoImages25.js';
import hero32Parser from './parsers/hero32.js';
import tableStripedBordered34Parser from './parsers/tableStripedBordered34.js';
import tableNoHeader30Parser from './parsers/tableNoHeader30.js';
import hero35Parser from './parsers/hero35.js';
import cards3Parser from './parsers/cards3.js';
import columns28Parser from './parsers/columns28.js';
import hero37Parser from './parsers/hero37.js';
import columns16Parser from './parsers/columns16.js';
import cards36Parser from './parsers/cards36.js';
import columns40Parser from './parsers/columns40.js';
import video39Parser from './parsers/video39.js';
import columns12Parser from './parsers/columns12.js';
import headerParser from './parsers/header.js';
import metadataParser from './parsers/metadata.js';
import articleintroParser from './parsers/articleintro.js';
import removecontentTransformer from './transformers/removecontent.js';
import verticalParser from './parsers/vertical.js';
import articlecontentParser from './parsers/articlecontent.js';
import metadataNewsParser from './parsers/metadataNews.js';
import cleanupTransformer from './transformers/cleanup.js';
import imageTransformer from './transformers/images.js';
import linkTransformer from './transformers/links.js';
import injectTransformer from './transformers/inject.js';
import { TransformHook } from './transformers/transform.js';
import {
  generateDocumentPath,
  handleOnLoad,
  TableBuilderNews,
  mergeInventory,
  getPathSegments,
} from './import.utils.js';

let parsers = {
  metadata: metadataParser,
  tableStripedBordered6: tableStripedBordered6Parser,
  columns2: columns2Parser,
  cards9: cards9Parser,
  cardsNoImages10: cardsNoImages10Parser,
  columns11: columns11Parser,
  columns8: columns8Parser,
  hero5: hero5Parser,
  columns14: columns14Parser,
  cards13: cards13Parser,
  carousel7: carousel7Parser,
  search17: search17Parser,
  hero15: hero15Parser,
  columns22: columns22Parser,
  tableStripedBordered24: tableStripedBordered24Parser,
  carousel23: carousel23Parser,
  cardsNoImages21: cardsNoImages21Parser,
  columns1: columns1Parser,
  columns26: columns26Parser,
  cardsNoImages25: cardsNoImages25Parser,
  hero32: hero32Parser,
  tableStripedBordered34: tableStripedBordered34Parser,
  tableNoHeader30: tableNoHeader30Parser,
  hero35: hero35Parser,
  cards3: cards3Parser,
  columns28: columns28Parser,
  hero37: hero37Parser,
  columns16: columns16Parser,
  cards36: cards36Parser,
  columns40: columns40Parser,
  video39: video39Parser,
  columns12: columns12Parser,
};

const newsparsers = {
  metadataNews: metadataNewsParser,
  articleintro: articleintroParser,
  articlecontent: articlecontentParser,
  vertical: verticalParser,
};

const transformers = {
    cleanup: cleanupTransformer,
    images: imageTransformer,
    links: linkTransformer,
    inject: injectTransformer,
    removecontent: removecontentTransformer,
  };
  
  WebImporter.Import = {
    findSiteUrl: (instance, siteUrls) => (
      siteUrls.find(({ id }) => id === instance.urlHash)
    ),
    transform: (hookName, element, payload) => {
      // perform any additional transformations to the page
      Object.entries(transformers).forEach(([, transformerFn]) => (
        transformerFn.call(this, hookName, element, payload)
      ));
    },
    getParserName: ({ name, key }) => key || name,
    getElementByXPath: (document, xpath) => {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
      );
      return result.singleNodeValue;
    },
    getFragmentXPaths: (
      { urls = [], fragments = [] },
      sourceUrl = '',
    ) => (fragments.flatMap(({ instances = [] }) => instances)
      .filter((instance) => {
        // find url in urls array
        const siteUrl = WebImporter.Import.findSiteUrl(instance, urls);
        if (!siteUrl) {
          return false;
        }
        return siteUrl.url === sourceUrl;
      })
      .map(({ xpath }) => xpath)),
  };
  
  let pageElements = [{ name: 'metadata' }];
  
  /**
  * Page transformation function
  */
  function transformPage(main, { inventory, ...source }) {
    const { urls = [], blocks: inventoryBlocks = [] } = inventory;
    const { document, params: { originalURL } } = source;
  
    // get fragment elements from the current page
    const fragmentElements = WebImporter.Import.getFragmentXPaths(inventory, originalURL)
      .map((xpath) => WebImporter.Import.getElementByXPath(document, xpath))
      .filter((el) => el);
  
    // get dom elements for each block on the current page
    const blockElements = inventoryBlocks
      .flatMap((block) => block.instances
        .filter((instance) => WebImporter.Import.findSiteUrl(instance, urls)?.url === originalURL)
        .map((instance) => ({
          ...block,
          element: WebImporter.Import.getElementByXPath(document, instance.xpath),
        })))
      .filter((block) => block.element);
  
    // remove fragment elements from the current page
    fragmentElements.forEach((element) => {
      if (element) {
        element.remove();
      }
    });
  
    // before page transform hook
    WebImporter.Import.transform(TransformHook.beforePageTransform, main, { ...source });
  
    const tableBuilder = TableBuilderNews(WebImporter.DOMUtils.createTable);
    // transform all block elements using parsers
    [...pageElements, ...blockElements].forEach(({ element = main, ...pageBlock }) => {
      const parserName = WebImporter.Import.getParserName(pageBlock);
      const parserFn = parsers[parserName];
      if (!parserFn) return;
      try {
        // before parse hook
        WebImporter.Import.transform(TransformHook.beforeParse, element, { ...source });
        // parse the element
        WebImporter.DOMUtils.createTable = tableBuilder.build(parserName);
        parserFn.call(this, element, { ...source });
        WebImporter.DOMUtils.createTable = tableBuilder.restore();
        // after parse hook
        WebImporter.Import.transform(TransformHook.afterParse, element, { ...source });
      } catch (e) {
        console.warn(`Failed to parse block: ${pageBlock.key}`, e);
      }
    });
  }
  
  /**
  * Fragment transformation function
  */
  function transformFragment(main, { fragment, inventory, ...source }) {
    const { document, params: { originalURL } } = source;
  
    if (fragment.name === 'nav') {
      const navEl = document.createElement('div');
  
      // get number of blocks in the nav fragment
      const navBlocks = Math.floor(fragment.instances.length / fragment.instances.filter((ins) => ins.uuid.includes('-00-')).length);
      console.log('navBlocks', navBlocks);
  
      for (let i = 0; i < navBlocks; i += 1) {
        const { xpath } = fragment.instances[i];
        const el = WebImporter.Import.getElementByXPath(document, xpath);
        if (!el) {
          console.warn(`Failed to get element for xpath: ${xpath}`);
        } else {
          navEl.append(el);
        }
      }
  
      // body width
      const bodyWidthAttr = document.body.getAttribute('data-hlx-imp-body-width');
      const bodyWidth = bodyWidthAttr ? parseInt(bodyWidthAttr, 10) : 1000;
  
      try {
        const headerBlock = headerParser(navEl, {
          ...source, document, fragment, bodyWidth,
        });
        main.append(headerBlock);
      } catch (e) {
        console.warn('Failed to parse header block', e);
      }
    } else {
      const tableBuilder = TableBuilderNews(WebImporter.DOMUtils.createTable);
  
      (fragment.instances || [])
        .filter((instance) => {
          const siteUrl = WebImporter.Import.findSiteUrl(instance, inventory.urls);
          if (!siteUrl) {
            return false;
          }
          return `${siteUrl.url}#${fragment.name}` === originalURL;
        })
        .map(({ xpath }) => ({
          xpath,
          element: WebImporter.Import.getElementByXPath(document, xpath),
        }))
        .filter(({ element }) => element)
        .forEach(({ xpath, element }) => {
          main.append(element);
  
          const fragmentBlock = inventory.blocks
            .find(({ instances }) => instances.find((instance) => {
              const siteUrl = WebImporter.Import.findSiteUrl(instance, inventory.urls);
              return `${siteUrl.url}#${fragment.name}` === originalURL && instance.xpath === xpath;
            }));
  
          if (!fragmentBlock) return;
          const parserName = WebImporter.Import.getParserName(fragmentBlock);
          const parserFn = parsers[parserName];
          if (!parserFn) return;
          try {
            WebImporter.DOMUtils.createTable = tableBuilder.build(parserName);
            parserFn.call(this, element, source);
            WebImporter.DOMUtils.createTable = tableBuilder.restore();
          } catch (e) {
            console.warn(`Failed to parse block: ${fragmentBlock.key}, with xpath: ${xpath}`, e);
          }
        });
    }
  }
  
  export default {
    onLoad: async (payload) => {
      await handleOnLoad(payload);
    },
  
    transform: async (source) => {
      const { document, params: { originalURL } } = source;
      console.log(originalURL);
      const [, ...pathSegments] = getPathSegments(originalURL);
      if (
        pathSegments.includes('fondation-pour-les-arbres-news') ||
        pathSegments.includes('fondation-pour-les-arbres-actualites')
      ) {
        console.log('Detected news page');
        pageElements = []; // No metadata parser needed in normal flow since we extract it early
        parsers = newsparsers;
      }
  
      // sanitize the original URL
      /* eslint-disable no-param-reassign */
      source.params.originalURL = new URL(originalURL).href;
  
      /* eslint-disable-next-line prefer-const */
      let publishUrl = window.location.origin;
      // $$publishUrl = '{{{publishUrl}}}';
  
      let inventory = null;
      // $$inventory = {{{inventory}}};
      if (!inventory) {
        const siteUrlsUrl = new URL('/tools/importer/site-urls.json', publishUrl);
        const inventoryUrl = new URL('/tools/importer/inventory.json', publishUrl);
        try {
          // fetch and merge site-urls and inventory
          const siteUrlsResp = await fetch(siteUrlsUrl.href);
          const inventoryResp = await fetch(inventoryUrl.href);
          const siteUrls = await siteUrlsResp.json();
          inventory = await inventoryResp.json();
          inventory = mergeInventory(siteUrls, inventory, publishUrl);
        } catch (e) {
          console.error('Failed to merge site-urls and inventory');
        }
        if (!inventory) {
          return [];
        }
      }
  
            let main = document.body;

      // For news pages, extract metadata BEFORE transformers run to avoid removal issues
      if (
        pathSegments.includes('fondation-pour-les-arbres-news') ||
        pathSegments.includes('fondation-pour-les-arbres-actualites')
      ) {
        console.log('Extracting metadata before transformers run');
        metadataNewsParser(main, { document });
      }

      // before transform hook
      WebImporter.Import.transform(TransformHook.beforeTransform, main, { ...source, inventory });
  
      // perform the transformation
      let path = null;
      const sourceUrl = new URL(originalURL);
      const fragName = sourceUrl.hash ? sourceUrl.hash.substring(1) : '';
      if (fragName) {
        // fragment transformation
        const fragment = inventory.fragments.find(({ name }) => name === fragName);
        if (!fragment) {
          return [];
        }
        main = document.createElement('div');
        transformFragment(main, { ...source, fragment, inventory });
        path = fragment.path;
      } else {
        // page transformation
        transformPage(main, { ...source, inventory });
        path = generateDocumentPath(source, inventory);
      }
  
      // after transform hook
      WebImporter.Import.transform(TransformHook.afterTransform, main, { ...source, inventory });
  
      return [{
        element: main,
        path,
      }];
    },
  };
  