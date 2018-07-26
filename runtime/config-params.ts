<<<<<<< HEAD
export type SkyuxConfigParams = {
=======
export type SkyuxConfigParams = string[] | {
>>>>>>> master
  [key: string]: boolean | {
    value?: any;
    required?: boolean;
    excludeFromRequests?: boolean;
  }
};
