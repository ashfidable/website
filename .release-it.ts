import type { Config } from 'release-it';

export default {
    git: {
        commitMessage: "chore: release ${version}"
    },
    github: {
        release: true,
        releaseName: "v${version}"
    },
    npm: {
        publish: false
    },
    plugins: {
        "@release-it/conventional-changelog": {
            infile: "CHANGELOG.md",
            preset: {
                name: "conventionalcommits",
                types: [
                    {
                        type: 'feat',
                        section: "🌟 New Features"
                    },
                    {
                        type: 'fix',
                        section: "🐛 Bug Fixes"
                    },
                    {
                        type: "docs",
                        section: "📖 Documentations"
                    },
                    {
                        type: 'perf',
                        section: "⚡ Performance Improvements"
                    }
                ]
            }
        }
    }
} satisfies Config;