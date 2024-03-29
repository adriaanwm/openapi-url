// type AllUnknown<T> = {
//   [K in keyof T]?: unknown
// }
//
// type NeverToOptional<T> = {
//   [K in keyof T as T[K] extends never ? K : never]?: T[K]
// }
//
// type NonNeverOnly<T> = {
//   [K in keyof T as T[K] extends never ? never : K]: T[K] extends object ? OptionalNever<T[K]> : T[K]
// }
//
// type OptionalNever<T> = AllUnknown<T> & NonNeverOnly<T> & NeverToOptional<T>
//
// type UrlArgs<Path, Method, Args, Queries> = {path: Path, method: Method} & OptionalNever<{args: Args, queries: Queries}>
//
// type FetchArgs<Path, Method, Args, Queries, RequestBody> = UrlArgs<Path, Method, Args, Queries> & OptionalNever<{
//   body: RequestBody,
// }>

type UrlArgs<Path, Method, Args, Queries> = {
  path: Path,
  method: Method,
  args?: Args,
  queries?: Queries,
  options?: UrlOptions
}

type FetchArgs<Path, Method, Args, Queries, RequestBody> = UrlArgs<Path, Method, Args, Queries> & { body?: RequestBody }

type FetchResult<ResponseBody> = {data?: ResponseBody, error?: any, raw: any}

type GetPath<Paths> = Extract<keyof Paths, string>
type GetMethod<Methods> = Extract<keyof Methods, string>
type GetArgs<MethodInfo> = MethodInfo extends { parameters: { path: infer A } } ? A : {}
type GetQueries<MethodInfo> = MethodInfo extends { parameters: { query: infer Q } } ? Q : {}
type GetRequestBody<Method> = Method extends { requestBody: { content: { 'application/json': infer R } } } ? R : {}
type GetResponseBody<Method> = Method extends { responses: {200: { content: { 'application/json': infer R } } } }
  ? R
  : Method extends { responses: {201: { content: { 'application/json': infer R2 } } } }
  ? R2
  : {}

export const ListQueryStyle = {
  commaSeparated: 'commaSeparated',
  repeatQuery: 'repeatQuery'
} as const

interface UrlOptions {
  listQueryStyle?: keyof typeof ListQueryStyle
  baseUrl: string
}

type UrlBuilderCreator = <Paths>(options: UrlOptions) => UrlBuilder<Paths>

type UrlBuilder<Paths> = <
  Path extends GetPath<Paths>,
  Method extends GetMethod<Paths[Path]>,
  Args extends GetArgs<Paths[Path][Method]>,
  Queries extends GetQueries<Paths[Path][Method]>,
>(options: UrlArgs<Path, Method, Args, Queries>) => URL

export type FetchBuilder = <Paths>(config: {urlBuilder: UrlBuilder<Paths>}) => <
  Path extends GetPath<Paths>,
  Method extends GetMethod<Paths[Path]>,
  Args extends GetArgs<Paths[Path][Method]>,
  Queries extends GetQueries<Paths[Path][Method]>,
  RequestBody extends GetRequestBody<Paths[Path][Method]>,
  ResponseBody extends GetResponseBody<Paths[Path][Method]>,
>(options: FetchArgs<Path, Method, Args, Queries, RequestBody>) => Promise<FetchResult<ResponseBody>>

export const urlBuilderCreator: UrlBuilderCreator = (defaultOptions) => ({path, args, queries, options}) => {
  options = {...defaultOptions, ...(options || {})}
  const pathWithArgs = Object.entries(args || {}).reduce(
    (p: string, [k, v]) => p.replace(`{${k}}`, encodeURIComponent(String(v))),
    path
  );
  const url = new URL(`${options.baseUrl}${pathWithArgs}`)
  const listQueryStyle = options.listQueryStyle || ListQueryStyle.commaSeparated
  Object.entries(queries || {}).forEach(([key, value]) => {
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

export const fetchBuilder: FetchBuilder = ({urlBuilder}) =>  async ({path, method, args, queries, body}) => {
  console.log(body, queries, args, path, method, urlBuilder)
  const u = urlBuilder({
    path,
    method,
    args,
    queries
  })
  const result = await fetch(u, {
    headers: {'Content-Type': 'application/json'},
    method: method.toUpperCase(),
    ...body ? {body: JSON.stringify(body)} : {}
  })
  const data = await result.json()
  return {data: data, raw: result}
}

// export const fetcher: FetchBuilder<Paths> = () => ({path, method, args, queries, body}) => {
//   return new Promise((resolve) => {
//     resolve({})
//   })
// }
