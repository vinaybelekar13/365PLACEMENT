import { prisma } from "@/lib/prisma";
import Syllabus from "@/app/components/Syllabus/Syllabus";

export default async function DSAPage() {
  const subject = await prisma.subject.findUnique({
    where: {
      name: "DSA",
    },
    include: {
      sections: {
        include: {
          topics: true,
        },
      },
    },
  });

  if (!subject) {
    return <div>DSA syllabus not found.</div>;
  }

  return (
    <Syllabus
      title={subject.name}
      sections={subject.sections}
    />
  );
}