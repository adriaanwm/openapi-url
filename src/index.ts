export const ListQueryStyle = {
  commaSeparated: 'commaSeparated',
  repeatQuery: 'repeatQuery'
} as const

interface Options {
  listQueryStyle?: keyof typeof ListQueryStyle
  baseUrl: string
}

type ArgsArgs<T> = [T] extends [never] ? {args?: T} : { args: T }

type UrlBuilderFunction = <Paths>(options: Options) =>
  <
    Path extends Extract<keyof Paths, string>,
    Method extends Extract<keyof Paths[Path], string>,
    Args extends Paths[Path][Method] extends { parameters: { path: any } }
      ? Paths[Path][Method]['parameters']['path']
      : never,
    Query extends Paths[Path][Method] extends { parameters: { query?: any } }
      ? Paths[Path][Method]['parameters']['query']
      : {},
  >(config:  {
    path: Path,
    method: Method,
    queries?: Query,
    options?: Partial<Options>
  } & ArgsArgs<Args>) => URL;

export const urlBuilder: UrlBuilderFunction = (defaultOptions) => ({
  path, method: _method, args, queries = {}, options
}) => {
  options = {...defaultOptions, ...(options || {})}
  const pathWithArgs = Object.entries(args || {}).reduce(
    (p: string, [k, v]) => p.replace(`{${k}}`, encodeURIComponent(String(v))),
    path
  );
  const url = new URL(`${options.baseUrl}${pathWithArgs}`)
  const listQueryStyle = options.listQueryStyle || ListQueryStyle.commaSeparated
  Object.entries(queries).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (listQueryStyle == ListQueryStyle.commaSeparated) {
        url.searchParams.set(key, value.join(','))
      } else {
        value.forEach(subvalue => url.searchParams.append(key, String(subvalue)))
      }
    } else {
      url.searchParams.append(key, String(value))
    }
  })
  return url
}
