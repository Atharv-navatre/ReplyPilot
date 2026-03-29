interface FooterProps {
  version: string
}

export function Footer({ version }: FooterProps) {
  return (
    <div className="pt-3 border-t border-gray-100">
      <p className="text-xs text-gray-400 text-center">
        v{version} • Made with ❤️ by ReplyPilot
      </p>
    </div>
  )
}
