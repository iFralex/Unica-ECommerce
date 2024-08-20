'use strict';

/**
 * viewer3d service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::viewer3d.viewer3d');
