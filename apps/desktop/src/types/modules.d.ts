declare module "docxtemplater/js/inspect-module.js" {
  interface InspectModuleInstance {
    getAllTags(): Record<string, unknown>;
  }

  export default function InspectModule(): InspectModuleInstance;
}
