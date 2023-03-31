import Swup from 'swup';
import SwupScriptsPlugin from '@swup/scripts-plugin';
import SwupHeadPlugin from '@swup/head-plugin'
import SwupPreloadPlugin from '@swup/preload-plugin';

const swup = new Swup({
    plugins: [
        new SwupHeadPlugin(), new SwupPreloadPlugin()],
    animationSelector: '[class*="swup-transition-"]',
    animateHistoryBrowsing: true,
});