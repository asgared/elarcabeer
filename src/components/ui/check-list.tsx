"use client";

import {List, ListIcon, ListItem} from "@chakra-ui/react";
import {FaCheck} from "react-icons/fa6";

type Props = {
  items: string[];
};

export function CheckList({items}: Props) {
  return (
    <List spacing={2}>
      {items.map((item) => (
        <ListItem key={item} color="whiteAlpha.800">
          <ListIcon as={FaCheck} color="brand.400" />
          {item}
        </ListItem>
      ))}
    </List>
  );
}
