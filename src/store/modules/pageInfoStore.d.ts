export interface TreeOptionBase {
  id?: id;
  label?: string;
  checkboxDisabled?: boolean;
  disabled?: boolean;
  isLeaf?: boolean;
  children?: TreeOption[];
  prefix?: () => VNodeChild;
  suffix?: () => VNodeChild;
}
export declare type TreeOption = TreeOptionBase & {
  [k: string]: unknown;
};

export type PageInfoType = {
  name: string
  id: string
}

export type PageNodeType = {
  name : string
  id : string
  label : string
}

export enum PageStoreEnums {
  PAGE_INFO = 'pageInfo',
  PAGE_NODE_INFO = 'pageNodeInfo',
  PAGE_LIST = 'pageList',
}

export interface PageStoreType {
  [PageStoreEnums.PAGE_INFO]: PageInfoType,
  [PageStoreEnums.PAGE_NODE_INFO]: PageNodeType[],
  [PageStoreEnums.PAGE_LIST]: PageNodeType[],
}
