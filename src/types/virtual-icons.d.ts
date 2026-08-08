declare module "virtual:site-icons" {
  const icons: Record<
    string,
    { body: string; width: number; height: number; left?: number; top?: number }
  >;
  export default icons;
}
