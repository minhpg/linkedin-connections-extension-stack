import { ConnectionOut } from "@/server/api/root";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Button,
} from "@tremor/react";
import Link from "next/link";

export function LiTable({
  data,
}: {
  data: ConnectionOut["getWithParams"]["data"];
}) {
  console.log(data.map((item) => item.entityUrn.split(":")[3]));
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Connected on</TableHeaderCell>
          <TableHeaderCell>Updated on</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.entityUrn}>
            <TableCell>
              <div className="size-12 overflow-hidden rounded-full bg-gray-300">
                {item.profilePicture ? (
                  <img
                    src={item.profilePicture}
                    alt={item.firstName}
                    className="w-full"
                  />
                ) : (
                  item.firstName[0]
                )}
              </div>
            </TableCell>
            <TableCell>
              <div>
                <span className="font-semibold text-black">
                  {item.firstName} {item.lastName}
                </span>{" "}
              </div>
              <div>
                (
                <Link
                  href={`https://linkedin.com/in/${item.publicIdentifier}`}
                  target="_blank"
                >
                  <Button variant="light">@{item.publicIdentifier}</Button>
                </Link>
                )
              </div>
              <div className="max-w-96 overflow-hidden text-wrap">
                {item.headline}
              </div>
            </TableCell>
            <TableCell>
              {new Date(item.connectedAt * 1000).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {new Date(item.updatedAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
