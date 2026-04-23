include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-pppoe-assist
PKG_VERSION:=0.1.17
PKG_RELEASE:=1

PKG_MAINTAINER:=Eugene Chan
PKG_LICENSE:=MIT
PKGARCH:=all

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-pppoe-assist
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=LuCI support for PPPoE IP prefix redial assistant
  DEPENDS:=+luci-base +jsonfilter
  PKGARCH:=all
endef

define Package/luci-app-pppoe-assist/description
  Monitor PPPoE interface IP addresses and redial when configured bad prefixes match.
endef

define Build/Compile
endef

define Package/luci-app-pppoe-assist/install
	$(INSTALL_DIR) $(1)/www
	$(CP) ./root/* $(1)/
	$(CP) ./htdocs/* $(1)/www/
endef

$(eval $(call BuildPackage,luci-app-pppoe-assist))
