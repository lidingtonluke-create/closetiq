export default function handler(req, res) {
  res.status(200).json({
    image:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMyYTIyYTIiLz48dGV4dCB4PSIxNTAiIHk9IjE1MCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJhY2tncm91bmQgUmVtb3ZlZDwvdGV4dD48L3N2Zz4=",
  });
}
