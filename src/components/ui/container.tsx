import {Box} from "@chakra-ui/react";
import type {BoxProps} from "@chakra-ui/react";

export interface ContainerProps extends BoxProps {
  centerContent?: boolean;
}

export function Container({centerContent, ...rest}: ContainerProps) {
  const centerProps: BoxProps = centerContent
    ? {display: "flex", flexDirection: "column", alignItems: "center"}
    : {};

  return (
    <Box
      w="100%"
      mx="auto"
      px={{base: 4, md: 6}}
      {...centerProps}
      {...rest}
    />
  );
}
