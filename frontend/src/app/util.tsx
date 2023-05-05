export function composeProviders(providers: any) {
  return providers.reduce(
    (Prev: any, Curr: any) =>
      function Providers({ children }: any) {
        return (
          <Prev>
            <Curr>{children}</Curr>
          </Prev>
        );
      }
  );
}
