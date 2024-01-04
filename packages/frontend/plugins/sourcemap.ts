import { Plugin } from 'vite';
import path from 'path';
import { FormData } from "formdata-node"
import {fileFromPathSync} from "formdata-node/file-from-path"

// vite插件编写sourcemap 也可以当一小节
const uploadSourceMapPlugin = (): Plugin => {
  return {
    name: 'upload-source-map',
    apply: 'build',
    writeBundle(outputOptions, bundle) {
      const form = new FormData();
      for (const fileName in bundle) {
        if (fileName.endsWith('.map')) {
          const filePath = path.resolve(outputOptions.dir || '', fileName);
          form.append('files', fileFromPathSync(filePath));
        }
      }
      console.log(Array.from(form));
       /** need nodejs >= 18 */
       fetch('http://localhost:1010/sourcemap', {
        body: form, method: 'POST',
      }).catch((error) => {
        console.error(`Failed to upload sourcemap: ${error}`);
      });
    }
  };
};

export default uploadSourceMapPlugin;
