import Swup from 'swup';
import SwupScriptsPlugin from '@swup/scripts-plugin';
import SwupHeadPlugin from '@swup/head-plugin'

const swup = new Swup({
    plugins: [new SwupScriptsPlugin(), new SwupHeadPlugin()],
    animationSelector: '[class*="swup-transition-*]',
});