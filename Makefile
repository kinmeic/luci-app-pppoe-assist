include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-pppoe-assist
PKG_VERSION:=0.1.1
PKG_RELEASE:=1

LUCI_TITLE:=LuCI support for PPPoE IP prefix redial assistant
LUCI_DEPENDS:=+luci-base +jsonfilter
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
