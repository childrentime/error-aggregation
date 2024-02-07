import { Plugin } from 'vite';
import { execSync } from 'child_process';

const gitCommitPlugin = (): Plugin => {
  return {
    name: 'version-inject',
      apply: 'build',
      transformIndexHtml: {
        enforce: 'pre',
        transform(html) {
          // 获取git commit hash作为版本ID
          const versionId = execSync('git rev-parse HEAD').toString().trim();
          global.versionId = versionId;
          // 将版本ID注入到HTML中
          return html.replace(
            '<head>',
            `<head>\n    <script>window.versionId = "${versionId}";</script>`
          );
        },
      },
  };
};

export default gitCommitPlugin;
