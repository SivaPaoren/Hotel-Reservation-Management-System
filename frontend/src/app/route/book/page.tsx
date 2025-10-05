import React, { Suspense } from "react";
import BookPageInner from "./BookPageInner";


export default function BookPage() {
  return (
    <Suspense fallback={<div>Loading booking page...</div>}>
      <BookPageInner />
    </Suspense>
  );
}
