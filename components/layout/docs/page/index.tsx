import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../../../lib/cn'
import { buttonVariants } from '../../../ui/button'
import { Edit, Text } from 'lucide-react'
import { I18nLabel } from 'fumadocs-ui/contexts/i18n'
import {
  type BreadcrumbProps,
  type FooterProps,
  PageBreadcrumb,
  PageFooter,
  PageTOCPopover,
  PageTOCPopoverContent,
  PageTOCPopoverTrigger,
} from './client'
import type { AnchorProviderProps, TOCItemType } from 'fumadocs-core/toc'
import * as TocDefault from '../../../toc/default'
import * as TocClerk from '../../../toc/clerk'
import { TOCProvider, TOCScrollArea } from '../../../toc'

interface BreadcrumbOptions extends BreadcrumbProps {
  enabled: boolean
  component: ReactNode
}

interface FooterOptions extends FooterProps {
  enabled: boolean
  component: ReactNode
}

export interface DocsPageProps {
  toc?: TOCItemType[]
  tableOfContent?: Partial<TableOfContentOptions>
  tableOfContentPopover?: Partial<TableOfContentPopoverOptions>

  /**
   * Extend the page to fill all available space
   *
   * @defaultValue false
   */
  full?: boolean

  /**
   * Replace or disable breadcrumb
   */
  breadcrumb?: Partial<BreadcrumbOptions>

  /**
   * Footer navigation, you can disable it by passing `false`
   */
  footer?: Partial<FooterOptions>

  children?: ReactNode
}

type TableOfContentOptions = Pick<AnchorProviderProps, 'single'> & {
  /**
   * Custom content in TOC container, before the main TOC
   */
  header?: ReactNode

  /**
   * Custom content in TOC container, after the main TOC
   */
  footer?: ReactNode

  enabled: boolean
  component: ReactNode

  /**
   * @defaultValue 'normal'
   */
  style?: 'normal' | 'clerk'
}

type TableOfContentPopoverOptions = Omit<TableOfContentOptions, 'single'>

export function DocsPage({
  breadcrumb: {
    enabled: breadcrumbEnabled = true,
    component: breadcrumb,
    ...breadcrumbProps
  } = {},
  footer = {},
  full = false,
  tableOfContentPopover: {
    enabled: tocPopoverEnabled,
    component: tocPopover,
    ...tocPopoverOptions
  } = {},
  tableOfContent: {
    enabled: tocEnabled,
    component: tocReplace,
    ...tocOptions
  } = {},
  toc = [],
  children,
}: DocsPageProps) {
  // disable TOC on full mode, you can still enable it with `enabled` option.
  tocEnabled ??=
    !full &&
    (toc.length > 0 ||
      tocOptions.footer !== undefined ||
      tocOptions.header !== undefined)

  tocPopoverEnabled ??=
    toc.length > 0 ||
    tocPopoverOptions.header !== undefined ||
    tocPopoverOptions.footer !== undefined

  let wrapper = (children: ReactNode) => children

  if (tocEnabled || tocPopoverEnabled) {
    wrapper = (children) => (
      <TOCProvider single={tocOptions.single} toc={toc}>
        {children}
      </TOCProvider>
    )
  }

  return wrapper(
    <>
      {tocPopoverEnabled &&
        (tocPopover ?? (
          <PageTOCPopover>
            <PageTOCPopoverTrigger />
            <PageTOCPopoverContent>
              {tocPopoverOptions.header}
              <TOCScrollArea>
                {tocPopoverOptions.style === 'clerk' ? (
                  <TocClerk.TOCItems />
                ) : (
                  <TocDefault.TOCItems />
                )}
              </TOCScrollArea>
              {tocPopoverOptions.footer}
            </PageTOCPopoverContent>
          </PageTOCPopover>
        ))}
      <article
        id="nd-page"
        data-full={full}
        className={cn(
          'mx-auto flex w-full max-w-[900px] flex-col gap-4 px-4 py-6 [grid-area:main] md:px-6 md:pt-8 xl:px-8 xl:pt-14',
          full ? 'max-w-[1200px]' : 'xl:layout:[--fd-toc-width:268px]'
        )}
      >
        {breadcrumbEnabled &&
          (breadcrumb ?? <PageBreadcrumb {...breadcrumbProps} />)}
        {children}
        {footer.enabled !== false &&
          (footer.component ?? <PageFooter items={footer.items} />)}
      </article>
      {tocEnabled &&
        (tocReplace ?? (
          <div
            id="nd-toc"
            className="sticky top-(--fd-docs-row-1) flex h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] w-(--fd-toc-width) flex-col pe-4 pt-12 pb-2 [grid-area:toc] max-xl:hidden"
          >
            {tocOptions.header}
            <h3
              id="toc-title"
              className="text-fd-muted-foreground inline-flex items-center gap-1.5 text-sm"
            >
              <Text className="size-4" />
              <I18nLabel label="toc" />
            </h3>
            <TOCScrollArea>
              {tocOptions.style === 'clerk' ? (
                <TocClerk.TOCItems />
              ) : (
                <TocDefault.TOCItems />
              )}
            </TOCScrollArea>
            {tocOptions.footer}
          </div>
        ))}
    </>
  )
}

export function EditOnGitHub(props: ComponentProps<'a'>) {
  return (
    <a
      target="_blank"
      rel="noreferrer noopener"
      {...props}
      className={cn(
        buttonVariants({
          variant: 'secondary',
          size: 'sm',
          className: 'not-prose gap-1.5',
        }),
        props.className
      )}
    >
      {props.children ?? (
        <>
          <Edit className="size-3.5" />
          <I18nLabel label="editOnGithub" />
        </>
      )}
    </a>
  )
}

/**
 * Add typography styles
 */
export function DocsBody({
  children,
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div {...props} className={cn('prose flex-1', className)}>
      {children}
    </div>
  )
}

export function DocsDescription({
  children,
  className,
  ...props
}: ComponentProps<'p'>) {
  // Don't render if no description provided
  if (children === undefined) return null

  return (
    <p
      {...props}
      className={cn('text-fd-muted-foreground mb-8 text-lg', className)}
    >
      {children}
    </p>
  )
}

export function DocsTitle({
  children,
  className,
  ...props
}: ComponentProps<'h1'>) {
  return (
    <h1 {...props} className={cn('text-[1.75em] font-semibold', className)}>
      {children}
    </h1>
  )
}

export { PageLastUpdate, PageBreadcrumb } from './client'
