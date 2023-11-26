//> using dep com.lihaoyi::os-lib:0.9.2

val getExtensionLessFiles: () => Seq[os.Path] = () => {
  os
    .walk(os.pwd / os.up / "archive")
    .filter(p => !os.isDir(p))
    .filter(_.ext == "")
}

val isBundledJsFile: os.Path => Boolean = p => p.segments.contains("bundles")

val makeRule: os.Path => String = f => {
  val path = s"/${f.relativeTo(os.pwd / os.up / "archive")}"
  val contentType = if (isBundledJsFile(f)) {
    "  Content-Type: text/javascript"
  } else {
    "  Content-Type: text/html"
  }
  s"""${path}
     |${contentType}
     |\n""".stripMargin
}
@main def main(): Unit = {
  val entries = getExtensionLessFiles()
  val rules = entries.map(makeRule)
  os.write.over(os.pwd / os.up / "archive"/ "_headers", rules)
}