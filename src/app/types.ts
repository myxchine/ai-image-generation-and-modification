interface Status {
  status: "success" | "error" | "neutral";
  message: string;
}

interface Image {
  uri: string;
  mimeType: string;
}
